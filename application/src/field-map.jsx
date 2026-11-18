import React, {useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync,createPortal} from 'react-dom';
import '../vendor/leaflet/leaflet.js';
import '../vendor/leaflet/leaflet.css';
import {icon} from './icons.js';
import {coordinates,types} from './domain.js';
import {priorities} from './navigation.js';

const L = window.L;
let root, surface, map;
let tiles;
const osmTiles='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const routeStyle={color:'#321ed3',weight:4,dashArray:'7 5',interactive:false};

function RoutePreview({trip}){
  const canvas=useRef(null);
  useLayoutEffect(()=>{
    const preview=L.map(canvas.current,{dragging:false,scrollWheelZoom:false,doubleClickZoom:false,
      boxZoom:false,keyboard:false,touchZoom:false,zoomControl:false,attributionControl:false});
    const points=trip.points.map(coordinates);
    preview.fitBounds(points,{padding:[15,15],maxZoom:16});
    L.tileLayer(osmTiles,{maxZoom:19}).addTo(preview);
    L.polyline(points,routeStyle).addTo(preview);
    trip.steps.forEach(({m},i)=>{
      const symbol=L.divIcon({className:'stage-index',html:String(i+1),iconSize:[22,22],iconAnchor:[11,11]});
      L.marker(coordinates(m.point),{icon:symbol,keyboard:false,interactive:false}).addTo(preview);
    });
    return ()=>preview.remove();
  },[trip]);
  return <><div className="preview-surface" ref={canvas}/><a className="preview-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© contributeurs OpenStreetMap</a></>;
}

function visiblePadding() {
  const rect = map.getContainer().getBoundingClientRect();
  const dock = document.querySelector('.dock-zone').getBoundingClientRect();
  const side = rect.width > 760 && dock.width < rect.width * 0.6;
  return {
    paddingTopLeft: [side ? dock.right - rect.left + 18 : 28, Math.min(125, rect.height / 3)],
    paddingBottomRight: [28, side ? 32 : Math.min(rect.bottom - dock.top + 22, rect.height * 0.58)]
  };
}

export function focusLocation(position) {
  if (!map) return;
  const {paddingTopLeft: start, paddingBottomRight: end} = visiblePadding();
  const zoom = Math.max(15, map.getZoom());
  const offset = L.point(start).subtract(L.point(end)).divideBy(2);
  map.setView(map.unproject(map.project(position, zoom).subtract(offset), zoom), zoom);
}

export function zoomBy(amount) {
  if (map) map.setZoom(map.getZoom() + amount);
}

function FieldMap({missions, position, selected, trip, onSelect, real, preview}) {
  const canvas = useRef(null);
  const [tileError, setTileError] = useState(false);
  useLayoutEffect(() => {
    const instance = L.map(canvas.current, {zoomControl:false, attributionControl:false, minZoom:2, maxZoom:19});
    map = instance;
    const points = missions.map(m => coordinates(m.point));
    if (points.length > 1) instance.fitBounds(points, {...visiblePadding(), maxZoom:16});
    else instance.setView(points[0] || position, 15);
    const failed = new Set();
    tiles = L.tileLayer(osmTiles, {maxZoom:19})
      .on('tileerror', e => { failed.add(e.tile); setTileError(true); })
      .on('tileunload', e => { failed.delete(e.tile); setTileError(failed.size > 0); })
      .addTo(instance);
    const resize = () => instance.invalidateSize({pan:false});
    const observer = window.ResizeObserver && new ResizeObserver(resize);
    if (observer) observer.observe(canvas.current);
    else window.addEventListener('resize',resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize',resize);
      tiles.off(); instance.remove(); tiles=null; map=null;
    };
  }, []);
  useLayoutEffect(() => {
    const layers = L.layerGroup().addTo(map);
    if (trip.steps.length) {
      L.polyline(trip.points.map(coordinates), routeStyle).addTo(layers);
    }
    const here = L.divIcon({className:'you',html:'<span></span>',iconSize:[34,34],iconAnchor:[17,17]});
    L.marker(position, {icon:here, keyboard:false, interactive:false,title:real?'Votre position':'Position de démonstration'}).addTo(layers);
    for (const m of missions) {
      const index = trip.steps.findIndex(step => step.m.id === m.id);
      const title = types[m.type].name + ', ' + m.number + ', ' + m.place + ', priorité ' + priorities[m.priority];
      const markerIcon = L.divIcon({className:'pin '+m.type+(m.id===selected?' picked':''), iconSize:[44,44],iconAnchor:[22,28],
        html:'<span>'+(index<0?icon(types[m.type].icon,20):index+1)+'</span>'});
      const marker = L.marker(coordinates(m.point), {icon:markerIcon, title, zIndexOffset:m.id===selected?500:0})
        .on('click', () => onSelect(m.id)).addTo(layers);
      const element = marker.getElement();
      element.dataset.id=m.id;
      element.setAttribute('aria-label',title);
      if (m.id===selected) marker.bindTooltip(m.number+' · '+priorities[m.priority], {direction:'top',permanent:true,offset:[0,-25]}).openTooltip();
    }
    return () => layers.remove();
  }, [missions, position, selected, trip, onSelect, real]);
  return <><div className="leaflet-surface" ref={canvas} aria-label="Carte des missions à Angers" />
    {preview && createPortal(<RoutePreview trip={trip}/>,preview)}
    {tileError && <button className="tile-status" onClick={()=>tiles?.redraw()}>Fond de carte indisponible · Réessayer</button>}</>;
}

export function renderFieldMap(host, props) {
  if (!host) {
    root?.unmount(); root=null; surface=null;
    return;
  }
  if (!surface) {
    surface=document.createElement('div');
    surface.className='field-map-surface';
    root=createRoot(surface);
  }
  host.append(surface);
  flushSync(()=>root.render(<FieldMap {...props} preview={document.getElementById('routePreview')} />));
}

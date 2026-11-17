import {types} from './domain.js';
const paths={
  bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',up:'<path d="m6 15 6-6 6 6"/>',
  map:'<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2zM9 3v15m6-12v15"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  history:'<path d="M3 6v5h5"/><path d="M3.5 10a8.5 8.5 0 1 1 .7 6M12 7v5l3 2"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M4 6V5q0-2 3-2h10v3m4 5h-5v4h5"/>',
  pin:'<path d="M19.5 10c0 5.2-7.5 11-7.5 11S4.5 15.2 4.5 10a7.5 7.5 0 1 1 15 0z"/><circle cx="12" cy="10" r="2.2"/>',
  locate:'<circle cx="12" cy="12" r="6.5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="1"/>',
  route:'<path d="M4 7h14m-4-4 4 4-4 4M20 17H6m4-4-4 4 4 4"/>',
  battery:'<rect x="3" y="6" width="16" height="12" rx="2.5"/><path d="M21 10v4m-10-6-2.5 4H13l-2.5 4"/>',
  plug:'<path d="M8 3v4m8-4v4M6 7h12v3a6 6 0 0 1-12 0zm6 9v5"/>',
  tool:'<path d="M14 6a5 5 0 0 0-6 6l-5 5a2.5 2.5 0 0 0 4 4l5-6a5.5 5.5 0 0 0 7-7l-4 3-3-3 4-4z"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',back:'<path d="m13 5-7 7 7 7M6 12h15"/>',
  sort:'<path d="M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4"/>',
  filter:'<path d="M3 7h5m4 0h9M3 17h10m4 0h4"/><circle cx="10" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  flask:'<path d="M9 3h6m-5 0v6l-6 9c-1 2 0 3 2 3h12c2 0 3-1 2-3l-6-9V3M7 15h10"/>',
  plus:'<path d="M4 12h16M12 4v16"/>',minus:'<path d="M4 12h16"/>',cross:'<path d="m6 6 12 12M18 6 6 18"/>',
  check:'<path d="m4 12 5 5L20 6"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1"/>',
  navigation:'<path d="m4 10 16-6-6 16-3-7z"/>', calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M5 12h14"/>',
  bike:'<circle cx="5" cy="16" r="4"/><circle cx="19" cy="16" r="4"/><path d="m5 16 5-9 4 9H5m7-11h4l3 11M7 7h4"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M7 10V7a5 5 0 0 1 10 0"/>',
  camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-9v.5"/>',
  flag:'<path d="M5 21V4m0 1c5-5 9 5 15 0v10c-6 5-10-5-15 0"/>',
  reset:'<path d="M3 4v6h6M4 10a8 8 0 1 1 0 5"/>',
  layers:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5m-18 4 9 5 9-5"/>',
  alert:'<path d="m12 3 10 17H2zM12 9v5m0 3v.1"/>',receipt:'<path d="M5 3l3 1 4-1 4 1 3-1v18l-3-1-4 1-4-1-3 1zM9 8h6m-6 4h6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
};
export const icon=(key,size=20)=>'<svg class="icon" aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+(paths[key]||'')+'</svg>';

export function typeMark(type,large=false){return `<span class="type-mark ${type} ${large?'large':''}">${icon(types[type].icon,large?26:21)}</span>`}

# PonyOps · application terrain

Démo en français d’une tournée fictive à Angers. Node 22.12+ ou 24 et npm.

```sh
cd application
npm ci
npm run dev
```

Ouvrir l’adresse locale imprimée par Vite. Une modification dans `src/` actualise l’onglet local. Les visiteurs de l’URL de présentation voient la dernière version publiée.

```sh
npm test
npm run build
```

`dist/index.html` contient la démo entière, y compris les images et la police. Le parcours et les marqueurs restent disponibles hors connexion. Le fond OpenStreetMap et le guidage externe nécessitent un accès réseau. L’adresse de présentation du dépôt est `/pony-agent-app/terrain/`. Pour mettre à jour cette version depuis le dépôt, copier le fichier construit vers `../public/terrain/index.html` et pousser le changement. Le workflow Pages existant publie ce sous-dossier.

## Un passage en entretien

1. Dans **Missions**, toucher une ligne pour retrouver le véhicule sur la carte. Replier le panneau par sa poignée, puis toucher une autre épingle pour ouvrir sa fiche.
2. Sur la fiche, glisser la poignée de **Glisser pour accepter** jusqu’à l’autre extrémité et relâcher. Le bouton **Accepter** fait la même chose. **S’y rendre** ouvre Google Maps. Au retour, **Je suis arrivé** donne accès au scan, puis au déverrouillage. Une batterie se confirme sur place avec photo. Les autres interventions proposent le guidage vers le dépôt avant la preuve finale.
3. Pour montrer une contestation immédiatement après réinitialisation, ouvrir **Historique → Rejetées → Rue des Carmes → Contester**. La photo avec repère et la précision du GPS permettent une validation dans ce scénario. Pour jouer l’autre branche, choisir **Photo inexploitable** dans **Démo** avant l’intervention, envoyer la photo de démo, contester le refus puis utiliser **Simuler la réponse du support**.
4. Depuis la carte, ouvrir **Pony Smart**. Le tri privilégie les interventions critiques puis les dépôts ciblés, avant les autres tâches ; les gains passent après la couverture et le temps. Ouvrir **Explorer la préparation du soir** et confirmer la réinitialisation : deux missions pilotes ciblent campus et hôpital avant 20 h. Les missions qui ne rentrent pas et le besoin gare à 7 h 30 restent explicitement non couverts. Ajouter/retirer/réordonner une étape recalcule les contraintes et la possibilité de confirmer.
5. **Démo → Réinitialiser la démo** restaure les huit missions de journée et les reçus de départ sur cet appareil.

## Où modifier

| Fichier | Contenu |
| --- | --- |
| `src/domain.js` | Données, tarifs, délais, états, GPS et scénarios |
| `src/field-map.jsx`, `src/navigation.js` | Carte React/Leaflet, distances et liens GPS |
| `src/field.js`, `src/field.css` | Panneau mobile, sélection et proposition de tournée |
| `src/slider.js` | Geste d’acceptation et équivalent au clavier |
| `src/appeals.js`, `src/sheets.js` | Réexamen des pièces, décision support, reçus et dépose |
| `src/tours.js`, `src/smart.js` | Priorités Pony, contraintes horaires, besoins non couverts et estimations |
| `src/pages.js`, `src/main.js` | Navigation, historique, revenus, événements et persistance |
| `src/style.css` | Couleurs et typographie Pony |

## Hypothèses de la proposition

Les durées de travail sont fictives (12 min pour une batterie, 18 min pour une relocalisation, 25 min pour une recharge et 35 min pour un retour atelier). Les trajets utilisent une vitesse moyenne de 16 km/h sur le plan schématique. La proposition maximise successivement le nombre d’interventions critiques, de dépôts ciblés puis d’autres tâches réalisables. La durée départage les couvertures égales avant les gains. Elle distingue échéance de prise en charge et échéance de dépôt, et plafonne la tournée à la fin de couverture du prestataire (20 h). Le besoin gare du lendemain reste non couvert. Les cibles pilotes sont fictives et aucune présence au créneau cible n’est mesurée. Le tarif d’une étape reste conditionné à la validation de son dépôt.

Les nouveaux dossiers stockent dans `timing` les instants réels (millisecondes Unix) d’acceptation, d’arrivée au véhicule, de début et de fin d’intervention, d’arrivée éventuelle au dépôt et de validation. L’horloge de démo reste utilisée pour les échéances et les revenus. Les instants manquants des anciens dossiers restent inconnus.

## Simulation et actifs

L’horloge commence le 16 novembre 2026 à 09:40, heure de Paris. Les véhicules, destinations, décisions et sommes sont fictifs. Les scénarios sont déterministes. Une photo prise ou importée reste dans le navigateur. Les deux photos de démonstration sont des illustrations générées. Leaflet 1.9.4 (licence BSD dans `vendor/leaflet/LICENSE`) affiche le fond OpenStreetMap. Le bouton de localisation demande la position du navigateur. Les distances du panneau sont calculées à vol d’oiseau depuis cette position ou depuis celle de démonstration. L’aperçu de Pony Smart reprend les étapes sur le même fond OpenStreetMap. Une mission ne peut être payée deux fois et une décision simulée ne déclenche aucun virement.

Pony conserve les droits sur sa marque. Le logo et la palette proviennent du kit média Pony. DM Sans est distribuée sous SIL OFL 1.1, avec sa licence dans `src/assets/OFL-DM-Sans.txt`. Direction d’interface appliquée avec **Unslop**, de Damir Sokolovsky, CC BY 4.0. Ce prototype est réalisé pour une étude de cas.


## Partie 2

Voir [le diagnostic et la restitution](../docs/PART2.md). Le scénario du soir débute à 19 h et réinitialise explicitement la démo après confirmation. Les deux missions supplémentaires sont isolées du scénario journée ; les anciennes sauvegardes restent lisibles. Les coordonnées des destinations pilotes sont fictives.

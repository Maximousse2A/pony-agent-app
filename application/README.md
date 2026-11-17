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

`dist/index.html` contient la démo entière, y compris les images et la police. On peut l’ouvrir sur le Mac sans réseau. L’adresse de présentation du dépôt est `/pony-agent-app/terrain/`. Pour mettre à jour cette version depuis le dépôt, copier le fichier construit vers `../public/terrain/index.html` et pousser le changement. Le workflow Pages existant publie ce sous-dossier.

## Un passage en entretien

1. Dans **Missions**, toucher une ligne pour retrouver le véhicule sur la carte. Replier le panneau par sa poignée, puis toucher une autre épingle pour ouvrir sa fiche.
2. Sur la fiche, glisser la poignée de **Glisser pour accepter** jusqu’à l’autre extrémité et relâcher. Le scan, le déverrouillage et la dépose se poursuivent dans le même dossier.
3. Pour montrer une contestation immédiatement après réinitialisation, ouvrir **Historique → Rejetées → Rue des Carmes → Contester**. La photo avec repère et la précision du GPS permettent une validation dans ce scénario. Pour jouer l’autre branche, choisir **Photo inexploitable** dans **Démo** avant l’intervention, envoyer la photo de démo, contester le refus puis utiliser **Simuler la réponse du support**.
4. Depuis la carte, ouvrir **⚡ Tournée IA**. Choisir 1 heure, une demi-journée (4 h) ou une journée (8 h). Modifier l’ordre ou le contenu et comparer la durée et les gains avant de confirmer. La confirmation enregistre un itinéraire indicatif et chaque mission garde son propre geste d’acceptation.
5. **Démo → Réinitialiser la démo** restaure les huit missions et les reçus de départ sur cet appareil.

## Où modifier

| Fichier | Contenu |
| --- | --- |
| `src/domain.js` | Données, tarifs, délais, états, GPS et scénarios |
| `src/field.js`, `src/field.css` | Carte, panneau mobile, sélection et proposition de tournée |
| `src/slider.js` | Geste d’acceptation et équivalent au clavier |
| `src/appeals.js`, `src/sheets.js` | Réexamen des pièces, décision support, reçus et dépose |
| `src/tours.js` | Calcul de l’ordre et des estimations |
| `src/pages.js`, `src/main.js` | Navigation, historique, revenus, événements et persistance |
| `src/style.css` | Couleurs et typographie Pony |

## Hypothèses de la proposition

Les durées de travail sont fictives (12 min pour une batterie, 18 min pour une relocalisation, 25 min pour une recharge et 35 min pour un retour atelier). Les trajets utilisent une vitesse moyenne de 16 km/h sur le plan schématique. La proposition maximise les tarifs cumulés dans la durée choisie en respectant les échéances, avec le temps total comme second critère. Le tarif d’une étape reste conditionné à la validation de son dépôt.

## Simulation et actifs

L’horloge commence le 16 novembre 2026 à 09:40, heure de Paris. Les coordonnées, distances, décisions et sommes sont fictives. Les scénarios sont déterministes. Une photo prise ou importée reste dans le navigateur. Les deux photos de démonstration sont des illustrations générées. Le fond de carte est un plan schématique original. Une mission ne peut être payée deux fois et une décision simulée ne déclenche aucun virement.

Pony conserve les droits sur sa marque. Le logo et la palette proviennent du kit média Pony. DM Sans est distribuée sous SIL OFL 1.1, avec sa licence dans `src/assets/OFL-DM-Sans.txt`. Direction d’interface appliquée avec **Unslop**, de Damir Sokolovsky, CC BY 4.0. Ce prototype est réalisé pour une étude de cas.


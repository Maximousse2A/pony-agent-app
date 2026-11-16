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

1. Ouvrir **Missions** et sélectionner **Relocalisation · Place du Ralliement**. Montrer le motif, la date, l’échéance et le tarif de 4,00 €.
2. Prendre la mission, simuler le scan et le déverrouillage, confirmer le déplacement.
3. Au dépôt, le GPS simulé indique une précision de ± 42 m. Choisir **Utiliser la photo démo**, puis **Envoyer en vérification**. Le reçu est en attente, aucun montant supplémentaire n’est approuvé.
4. Ouvrir **Simuler la décision de supervision** sur le reçu et approuver. Le montant rejoint les revenus une seule fois. L’historique conserve le motif initial.
5. Dans **Démo**, choisir **Position hors zone** pour reproduire un rejet sur la mission suivante. Le bouton de réinitialisation restaure les données de départ.

## Où modifier

| Fichier | Contenu |
| --- | --- |
| `src/domain.js` | Données, tarifs en centimes, délais, transitions, résultats de dépôt |
| `src/pages.js` | Carte, liste, historique et revenus |
| `src/sheets.js` | Détail, parcours terrain, réglages et reçus |
| `src/main.js` | Événements, persistance locale, capture de photo, zoom et déplacement |
| `src/style.css` | Couleurs, typographie et affichage mobile |
| `tests/domain.test.js` | Vérifications des règles métier |

## Simulation et actifs

L’horloge commence le 16 novembre 2026 à 09:40, heure de Paris. Les coordonnées, distances, décisions et sommes sont fictives. Les scénarios sont déterministes. Une photo prise ou importée reste dans le navigateur. Les deux photos de démonstration sont des illustrations générées. Le fond de carte est un plan schématique original. Une mission ne peut être payée deux fois et une décision simulée ne déclenche aucun virement.

Pony conserve les droits sur sa marque. Le logo et la palette proviennent du kit média Pony. DM Sans est distribuée sous SIL OFL 1.1, avec sa licence dans `src/assets/OFL-DM-Sans.txt`. Direction d’interface appliquée avec **Unslop**, de Damir Sokolovsky, CC BY 4.0. Ce prototype est réalisé pour une étude de cas.


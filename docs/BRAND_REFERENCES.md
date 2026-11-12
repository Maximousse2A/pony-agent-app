# Références visuelles Pony

État de la recherche : **12 novembre 2026**. Cette note distingue les éléments observés, les sources officielles vérifiées et les choix d’approximation du prototype.

## Captures fournies

Six captures de l’application grand public, en JPEG 281 × 610, ont servi de références : carte avec actions de scan, compte, parrainage, roue de récompenses, fin de participation et tarification.

Les originaux restent hors du dépôt public. Aucun identifiant de parrainage ni autre contenu personnel visible n’est reproduit. Les écrans de parrainage et de roulette apportent des références de style uniquement ; ils ne justifient pas l’ajout d’une fonctionnalité métier ni d’une fonctionnalité de Partie 2.

### Éléments directement observables

- Fonds et en-têtes violets profonds ; corps de pages blanc.
- Bleu roi pour les actions principales, textes et pictogrammes sélectionnés.
- Cyan vif pour les titres d’accent, chiffres et indicateurs sur fond violet.
- Corail pour les actions secondaires, liens de retour et certains visuels.
- Sans-serif géométrique avec titres très gras et corps plus léger.
- Boutons larges en pilule, variantes pleines et contour fin ; surface blanche arrondie au bas de la carte.
- Espaces généreux, séparateurs discrets, panneaux de prix très clairs, faible densité d’ombres.
- Pictogrammes simples et repères blancs/bleus sur la carte ; un avatar en disque à rayures diagonales apparaît sur l’écran compte.

Des images fixes n’établissent ni la durée, ni la courbe, ni même la présence d’animations dans l’application. Toute transition ajoutée au prototype est donc un choix de réalisation, pas une reproduction vérifiée. Le respect de `prefers-reduced-motion` reste pertinent.

## Palette officielle retenue

La page [Presse / Kit média Pony](https://getapony.com/presse#KIT-MEDIA) publie explicitement les couleurs et leurs codes. Ces valeurs sont retenues plutôt que de reconstruire une palette depuis les pixels JPEG.

| Rôle                           | Nom du kit | HEX officiel |
| ------------------------------ | ---------- | ------------ |
| Encre, en-tête, fond de marque | Violet     | `#321E64`    |
| Actions principales            | Bleu roi   | `#321ED3`    |
| Accent sur violet              | Cyan       | `#00FFFF`    |
| Accent secondaire              | Corail     | `#FE6D80`    |
| Surfaces et texte sur bouton   | Blanc      | `#FFFFFF`    |

Vérification indicative des captures : les couleurs dominantes des zones unies apparaissent autour de `#321E65` pour le violet, `#321FD3` pour le bleu, `#F46E81` pour le corail et `#FFFFFF` pour le blanc. La compression JPEG et le traitement colorimétrique rendent ces échantillons approximatifs. Le cyan et le corail ne doivent pas être utilisés comme petits textes sur fond blanc sans vérifier leur contraste ; la teinte violette porte le texte courant.

Le [CSS du site officiel anglophone](https://getapony.com/_next/static/css/250237a5bba8d11adb58.css) contient aussi des valeurs proches, dont `#321e65`, `#00ffff`, `#edeaf5`, `#ccffff` et `#f46d80`. Pour l’implémentation, le kit média actuel constitue la source principale. Les déclinaisons lavande de fond et les teintes sémantiques opérationnelles du prototype sont des choix d’adaptation.

## Typographie

Le CSS officiel déclare **Matter Regular** et **Matter Heavy** pour le site Pony. La page [Matter de Displaay](https://displaay.net/typeface/matter/) identifie la famille commerciale. Cette preuve concerne le site web ; elle ne prouve pas la famille exacte embarquée dans l’application mobile montrée par les captures.

Les fichiers Matter servis par le site ne sont pas ajoutés au dépôt. Le prototype utilise **DM Sans** comme approximation libre : géométrie ronde, bonne lisibilité en petit corps et gamme de graisses adaptée aux titres lourds. Il s’agit d’un choix de proximité visuelle, pas d’une police officiellement Pony.

Le fichier latin variable est inclus localement pour éviter une requête Google Fonts à l’exécution : `public/fonts/dm-sans-latin-variable.woff2`. Sa licence SIL OFL 1.1 et sa provenance sont conservées dans `public/fonts/`. Les caractères accentués français, le signe euro et les apostrophes typographiques utilisés par l’application sont couverts par le sous-ensemble livré.

## Logo

Les versions blanche et violette du mot-symbole proviennent des SVG générés par le kit média officiel. Elles sont disponibles dans `public/brand/pony-white.svg` et `public/brand/pony-purple.svg`, avec leur source et le contexte d’utilisation dans le même dossier. Elles remplacent une approximation typographique du logo ; les autres icônes d’interface restent des éléments de prototype.

## Limites d’adaptation

Le prototype transpose cette identité à un outil d’agents terrain : les missions, preuves de dépôt, statuts et revenus restent ceux de la Partie 1. La navigation, les états opérationnels et l’accessibilité sont adaptés à ce contexte. Aucun résultat d’entretien ni problème prioritaire n’a été déduit des captures de l’application grand public.

# Design QA · Adaptation de la DA Pony

Date : 12 novembre 2026. Périmètre : transposition de la direction artistique des captures grand public vers l’application agents existante. Il ne s’agit pas de reproduire les fonctionnalités, les textes, les métriques ou la géographie de l’application clients.

## Référence et preuves

- Références privées : six JPEG 281 × 610 fournis dans la conversation. Référence carte : `/var/folders/0j/s1tdgw2x56gb111x576zg02m0000gn/T/codex-clipboard-b40d869e-02af-43ac-b6cf-0d1da8415ac3.jpg`. Référence compte : `codex-clipboard-705b9ded-3adc-4138-ba15-d4339c23200c.jpg` dans le même dossier. Les autres vues concernent le parrainage, les récompenses et les prix ; leur style sert de référence, sans ajout de ces fonctions.
- Implémentation navigateur : `http://127.0.0.1:5173/pony-agent-app/`, code React/Vite existant.
- Preuves locales privées, hors dépôt : `../../work/pony-brand-qa/`. Vues finales : `map-mobile-v2.jpg`, `earnings-mobile-v2.jpg`, `mission-mobile-v2.jpg`, `deposit-mobile-v2.jpg`, `mission-320-fixed.jpg`, `map-desktop-v2.jpg`.
- Comparaison commune : `comparison-v1.jpg` puis `comparison-v2.jpg`, chaque planche contenant référence et implémentation côte à côte. Détails des actions : `focus-v1.jpg` puis `focus-v2.jpg`, avec la feuille blanche et les boutons de référence face aux actions du prototype. Ces fichiers ont été ouverts et comparés visuellement.
- Normalisation : références 281 × 610 pixels ; captures mobiles 390 × 844 CSS px/pixels, ramenées à 281 × 608 pour les planches, sans étirement. Les 2 pixels de hauteur restants et la barre système des références ne sont pas traités comme des écarts de DA. Le prototype ne dessine pas une fausse barre système.
- Vérification complémentaire : téléphone étroit 320 × 740 et ordinateur 1440 × 1000 ; les dimensions CSS et les largeurs de défilement ont été lues dans le navigateur.

## Comparaison des surfaces requises

| Surface | Observation et résultat |
| --- | --- |
| Typographie | Titres géométriques très gras, corps léger et chiffres d’accent rapprochés des références. Le site officiel déclare Matter, mais la famille de l’app mobile n’est pas établie. DM Sans variable, libre et fournie localement, est une approximation explicitement documentée. Chargement de la police confirmé dans le navigateur. |
| Espacement et structure | Panneaux blancs à angles de 28 px, boutons en pilule, séparateurs fins et peu d’ombres. Le panneau de mission monte depuis le bas sur téléphone ; la version ordinateur conserve un panneau latéral. Les titres et la liste de missions restent adaptés au contexte agents. |
| Couleurs | Palette officielle du kit Pony : violet `#321E64`, bleu `#321ED3`, cyan `#00FFFF`, corail `#FE6D80`, blanc. En-têtes violets, chiffres cyan, actions bleues, carte lavande. Les petites légendes sur blanc gardent une teinte violette plus contrastée que le cyan/corail pur. |
| Actifs et qualité | Vrais mots-symboles SVG du kit officiel ; aucune approximation typographique du logo. Icônes d’interface existantes conservées et harmonisées. Le plan géographique et la preuve illustrée restent les éléments fonctionnels fictifs déjà présents, recolorés ; les illustrations de jeu client ne sont pas ajoutées au produit agents. |
| Contenu et copie | Parcours, tarifs, motifs, dates, revenus et identifiants de Partie 1 conservés. Aucun texte de parrainage, jeu, résultat d’entretien ou nouvelle fonctionnalité de Partie 2 importé depuis les références. |

## Historique des constats et corrections

1. Premier contrôle visuel, 390 px : la grande graisse et l’espace du badge pouvaient couper `PN-2841` entre le préfixe et les chiffres. **[P2] Corrigé** en gardant le groupe d’identifiant insécable. La capture `mission-mobile-v2.jpg` confirme l’identifiant complet.
2. Contrôle à 320 px : le badge de montant dépassait à droite d’environ 5 px ; largeur de défilement du panneau 325 pour un écran de 320. **[P2] Corrigé** en supprimant l’icône redondante du titre sur les écrans très étroits et en permettant au bloc de titre de se réduire. Après correction : document 320 px, panneau 320 px ; preuve `mission-320-fixed.jpg`.
3. Premier contrôle de palette : certaines variantes de repères de carte étaient encore des teintes de l’ancienne démo. **[P2] Corrigé** avec les couleurs du kit ; pictogrammes violets sur repères cyan/corail pour rester lisibles. Preuves post-correction : `map-mobile-v2.jpg`, `map-desktop-v2.jpg` et planche `comparison-v2.jpg`.

Une revue de code a aussi supprimé des réinitialisations CSS non stratifiées qui écrasaient les couleurs, tailles et marges des classes utilitaires. Le navigateur a confirmé pour l’action principale : texte blanc, fond `rgb(50, 30, 211)`, forme pilule. Ce correctif d’intégration est distinct des itérations visuelles ci-dessus.

## Interactions et accessibilité vérifiées

- Navigation carte, historique, revenus ; états sélectionnés et actions en pilule.
- Identifiant QR incorrect refusé, puis scan et déverrouillage simulés corrects.
- Checklist ; cases toujours cochées après rechargement de la page.
- Photo de démo, demande GPS automatique et position de secours explicitement simulée.
- Dépôt rejeté avec motif, preuve et montant payé à 0 € dans l’historique.
- Reset de la démo rétablit dix missions disponibles.
- Aucun débordement horizontal de page à 390 et 1440 px ; panneau de mission vérifié à 320 px après correction.
- Aucun avertissement ou erreur de console au contrôle final local.
- Contrastes des tokens contrôlés : blanc/bleu environ 9,28:1 ; violet/cyan environ 11,13:1 ; texte corail foncé/blanc environ 6,28:1. Focus corail visible, libellés et statuts conservés. La couleur ne remplace pas le texte des états.
- Entrées de panneaux 280–300 ms, changements de contenu 180 ms et retour d’appui discret. Les règles `prefers-reduced-motion` désactivent ces animations. Les captures fixes ne prouvent pas les animations de l’application source : ces durées restent des choix d’adaptation.

## Différences acceptées et suivi

- Les contenus, proportions générales et contrôles supplémentaires servent les missions terrain : la demande porte sur la DA, pas sur une copie écran par écran de l’application clients.
- La carte demeure schématique et fictive. Plusieurs missions proches peuvent se superposer ; leur liste reste l’accès complémentaire existant. Aucune fonctionnalité de regroupement ou d’optimisation n’est introduite avant discovery.
- **[P3]** La police exacte embarquée dans l’app mobile et ses animations nécessiteraient des actifs autorisés et une vidéo ou un accès direct. DM Sans et les transitions proposées sont des approximations assumées.

Aucun constat P0/P1/P2 ne reste ouvert après le second contrôle. Les limites P3 ci-dessus ne bloquent pas cette adaptation.

final result: passed

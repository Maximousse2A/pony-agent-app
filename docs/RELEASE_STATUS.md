# État de livraison · 14 novembre 2026

## Refonte pour les agents terrain

Version locale et publication **vérifiées**. L’ancienne version publiée était le commit applicatif `d30a5dfe3a308147b28edd8c4161768d6cf98451` ; les preuves de cette livraison sont conservées dans [l’archive du 12 novembre](RELEASE_STATUS_BRAND_2026-11-12.md).

| Élément                              | Résultat observé                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application                          | https://maximousse2a.github.io/pony-agent-app/                                                                                                                                                          |
| Dépôt                                | https://github.com/Maximousse2A/pony-agent-app                                                                                                                                                          |
| Commit applicatif de cette passe     | `33d8e29aaa2e1cafdfd65324b1d2ba1b5f981445`                                                                                                                                                              |
| GitHub Actions et Pages              | [Exécution 43569675110](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43569675110) réussie ; déploiement Pages `7784171652` sur le même commit                                            |
| Tests locaux                         | 19 réussis sous Node 24.22.3                                                                                                                                                                            |
| Build final local                    | Vite 7.3.8 : 89 modules, 769 ms ; JS `index-kEVaL-H9.js`, CSS `index-CYIoeff2.css`                                                                                                                      |
| QA locale                            | Deux écrans, reprise d’anciens états, photo et GPS de démo, trois résultats de dépôt, historique et revenus vérifiés ; voir [design-qa.md](../design-qa.md)                                             |
| Dimensions                           | Document sans débordement à 320/390/1440 px ; intervention/preuve à 320/390 px avec action basse visible                                                                                                |
| Ressources HTTP et navigateur public | HTML, favicon, JS, CSS, police et deux logos : HTTP 200, empreintes identiques au build local. Parcours sauvegardé PN-3017 conservé, carte et revenus parcourus, aucun avertissement ni erreur console. |

Liste compacte, confirmation explicite des trois points métier, scan/ouverture simulés regroupés, photo proposée immédiatement, GPS demandé automatiquement et secours explicite. Regroupement des cibles cartographiques trop proches, sans optimisation de tournée. Identité Pony conservée avec surfaces neutres, typographie allégée et une action principale.

L’usage dans la rue, la caméra d’un téléphone réel et une position GPS réelle réussie ne sont pas validés par ces contrôles de navigateur. Les opérations sont simulées, la carte schématique et les preuves restent sur l’appareil.

Partie 2 **non construite**, en attente d’entretiens. Échéance : **19 novembre 2026 à 12 h, Europe/Paris**. [Journal IA](AI_DEVELOPMENT_LOG.md), [audit terrain et attribution Unslop](FIELD_UX_REVIEW.md).

## Contrôle après publication

- Installation, 19 tests, build et déploiement réussis sur le commit applicatif exact ; le statut du déploiement Pages correspond au même SHA.
- JS publié : `index-kEVaL-H9.js`, SHA-256 `b3b1a69b4efac9ca642db7e4e337b645b14338207c8c7d2593bd0a7e30e3cc03`.
- CSS publié : `index-CYIoeff2.css`, SHA-256 `86888bbf890f43f628aa4ac26ef128820e67a736dbe49770ccb0d8dede684d54`.
- Navigateur public à 390 × 844 : document et panneau de 390 px, action « Scanner et ouvrir » de 52 px à y = 756,60–808,60. Scripts et feuille de style observés portent les noms ci-dessus.
- Ancienne sélection PN-3017 et historique préservés, sans réinitialisation publique ni progression de mission modifiée. En revenant à la liste, la reprise est proposée ; son bandeau ajoute une rangée à la hauteur de l’écran. Les échéances sauvegardées continuent de s’écouler et peuvent donc être dépassées.
- Carte regroupée et revenus de la nouvelle version inspectés ; console sans erreur ni avertissement. Captures finales conservées parmi les livrables locaux, hors dépôt.

Le commit documentaire final peut différer du commit applicatif déployé ; il ne change pas les ressources publiées vérifiées ci-dessus.

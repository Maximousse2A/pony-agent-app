# Livraison vérifiée · 12 novembre 2026

| Élément | Résultat observé |
| --- | --- |
| Application publiée | https://maximousse2a.github.io/pony-agent-app/ |
| Dépôt public | https://github.com/Maximousse2A/pony-agent-app |
| Commit applicatif déployé | `17cf48da1e2a4b716613a8ba4731ba6f5a086e9c` |
| GitHub Actions | [Exécution 43210965005](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43210965005), terminée avec succès |
| Installation, tests, build et déploiement CI | Toutes les étapes réussies pour ce commit |
| Vérification locale finale | `npm run build` réussi ; 10 tests de règles/dates réussis |
| Vérification HTTP | Page HTML, favicon, JavaScript et CSS : HTTP 200 ; fichiers JS/CSS identiques au build local par empreinte SHA-256 |
| Vérification navigateur public | Application affichée ; retour atelier parcouru du scan au dépôt en attente ; preuve retrouvée dans l’historique ; reset effectué |
| Vérification des quatre types | Batterie et relocalisation dans le navigateur de développement ; recharge dans le build de production local ; atelier dans la version publique ; quatre types couverts aussi par les tests de règles |
| Mobile et ordinateur | Rendus inspectés à 390 × 844 et 1440 × 1000 ; aucun débordement horizontal constaté aux deux dimensions |
| Console publique | Aucun avertissement ni erreur au contrôle final |

## Périmètre livré

React + Vite + Tailwind, missions fictives géolocalisées sur plan schématique d’Angers, filtres et tri, sélection, motif et date de création, scan/déverrouillage simulés, checklist adaptée au type d’intervention, dépôt avec photo et capture GPS automatique avec secours explicite, trois états de validation et rejets motivés, revue simulée, historique, revenus quotidiens/hebdomadaires et registre des gains, sauvegarde locale, export des données et reset.

Le navigateur de test n’a pas fourni de position réelle. La demande automatique, son échec et l’utilisation d’une position simulée ont été vérifiés. Les contrôles au dépôt restent volontairement simulés, les montants ne donnent lieu à aucun versement et la carte n’est pas un outil de navigation réelle.

## Suite du projet

La fonctionnalité de Partie 2 reste **non construite**, en attente des entretiens et de leur analyse. Le registre `discovery.md` ne contient aucun résultat inventé. Échéance du dossier : **19 novembre 2026 à 12 h, Europe/Paris**.

Les ajouts documentaires effectués après la publication peuvent avoir un commit distinct du commit applicatif ci-dessus. Ils ne changent pas les fichiers de l’application déployée.

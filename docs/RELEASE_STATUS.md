# Livraison vérifiée · 12 novembre 2026

## Version actuelle · identité visuelle Pony

| Élément | Résultat observé |
| --- | --- |
| Application publiée | https://maximousse2a.github.io/pony-agent-app/ |
| Dépôt public | https://github.com/Maximousse2A/pony-agent-app |
| Commit applicatif déployé | `d30a5dfe3a308147b28edd8c4161768d6cf98451` |
| GitHub Actions | [Exécution 43248012207](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43248012207), terminée avec succès |
| Déploiement GitHub Pages | `7741556361`, associé à ce commit applicatif |
| Installation, tests, build et déploiement CI | Toutes les étapes réussies pour ce commit |
| Build de production local | `npm run build` réussi avec Node.js 24.22.3 : 607 ms, 87 modules |
| Tests automatisés | 10 tests de règles et de dates réussis |
| Vérification HTTP publique | HTML, favicon, JavaScript, CSS, police et deux logos : HTTP 200 ; empreintes SHA-256 identiques aux fichiers du build local |
| Fichiers applicatifs vérifiés | `index-ZpnKr3aj.js` et `index-Ch6ICoFB.css` |
| Vérification navigateur locale | Mauvais QR puis scan correct, déverrouillage, checklist, preuve photo et GPS de démo, reprise après rechargement, rejet non payé dans l’historique et reset vérifiés |
| Mobile et ordinateur | Aucun débordement horizontal du document aux largeurs 390 et 1440 px ; panneau de mission corrigé puis vérifié à 320 px |
| Typographie et console locales | DM Sans chargée ; aucun avertissement ni erreur observés au contrôle final |
| Vérification navigateur public de cette version | Nouveau CSS chargé, mot-symbole officiel visible, fichier DM Sans chargé, détail de mission active conservé et écran des revenus parcouru ; document et panneau de mission à 390 px ; aucun avertissement ni erreur observés |

### Adaptation visuelle livrée

Palette du kit média officiel Pony, mots-symboles SVG officiels blanc et violet, en-têtes violets, actions bleu roi, accents cyan et corail, surfaces blanches et boutons en pilule. La carte, les filtres, l’historique, les revenus et le parcours de mission reprennent cette direction visuelle.

DM Sans est une approximation libre, incluse localement avec sa licence SIL OFL 1.1. La police exacte de l’application mobile et ses animations ne sont pas établies par les captures fixes. Les observations, sources officielles, licences et choix d’adaptation sont documentés dans [BRAND_REFERENCES.md](BRAND_REFERENCES.md). Les captures originales et le code de parrainage visible ne sont pas publiés dans le dépôt.

## Périmètre fonctionnel conservé

React + Vite + Tailwind, missions fictives géolocalisées sur un plan schématique d’Angers, filtres et tri, sélection, motif et date de création, scan/déverrouillage simulés, checklist adaptée au type d’intervention, dépôt avec photo et capture GPS automatique avec secours explicite, trois états de validation et rejets motivés, revue simulée, historique, revenus quotidiens/hebdomadaires, sauvegarde locale, export des données et reset.

Le navigateur de test n’a pas fourni de position réelle. La demande automatique, son échec et l’utilisation d’une position simulée ont été vérifiés. Les contrôles au dépôt restent simulés, les montants ne donnent lieu à aucun versement et la carte n’est pas un outil de navigation réelle.

## Archive · première livraison de Partie 1

La première version applicative a été publiée au commit `17cf48da1e2a4b716613a8ba4731ba6f5a086e9c`, avec [l’exécution GitHub Actions 43210965005](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43210965005) réussie. Sa page et ses ressources avaient été vérifiées en HTTP et dans le navigateur public. Les quatre types de mission avaient été parcourus entre les environnements de développement, production locale et publication, et couverts par les tests de domaine. Cette référence décrit la livraison initiale ; la version actuelle est celle indiquée en tête de document.

## Suite du projet

La fonctionnalité de Partie 2 reste **non construite**, en attente des entretiens et de leur analyse. Le registre [discovery.md](discovery.md) ne contient aucun résultat inventé. Échéance du dossier : **19 novembre 2026 à 12 h, Europe/Paris**.

Les ajouts documentaires peuvent avoir un commit distinct du commit applicatif déployé ci-dessus. Ils ne changent pas les fichiers applicatifs vérifiés. Le journal de développement est une synthèse traçable ; l’export intégral des conversations reste un livrable à préparer pour la restitution finale.

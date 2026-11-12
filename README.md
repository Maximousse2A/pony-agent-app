# Pony · Application agents

Prototype mobile-first pour le case study « Senior Product Manager, Internal Products & AI ». Interface en français, données fictives à Angers, React + Vite + Tailwind CSS, sans backend ni authentification réelle.

**[Ouvrir la démo publiée](https://maximousse2a.github.io/pony-agent-app/)** · [État de livraison vérifié](docs/RELEASE_STATUS.md) · [Journal du développement assisté par IA](docs/AI_DEVELOPMENT_LOG.md)

## Lancer le projet

Node.js 24 LTS recommandé ; validation locale effectuée avec Node.js 24.22.3 :

```sh
npm ci
npm run dev
```

Ouvrir l’adresse indiquée par Vite. Le projet utilise le préfixe `/pony-agent-app/` pour GitHub Pages.

```sh
npm test
npm run build
npm run preview
```

Le build statique se trouve dans `dist/`. Le workflow `.github/workflows/deploy.yml` contient la configuration de déploiement. La présence du workflow ne prouve pas qu’un déploiement a réussi : consulter les résultats GitHub Actions et vérifier l’URL publiée.

## Parcours de démonstration

1. Sélectionner une mission sur la carte ou dans la liste. Consulter sa création, son motif, son délai et son montant.
2. Démarrer la mission, simuler le scan du véhicule correspondant puis le déverrouillage.
3. Cocher les trois étapes adaptées au type de mission : batterie, relocalisation, recharge ou atelier.
4. Ajouter une photo ou utiliser le justificatif de démonstration. La position est demandée au navigateur au dépôt ; une position simulée reste disponible en cas de refus ou d’indisponibilité.
5. Choisir un scénario de démonstration : attente, approbation ou rejet motivé. Envoyer le dépôt.
6. Retrouver la mission dans l’historique et constater son effet sur les revenus. Les montants rejetés ne sont pas ajoutés aux revenus approuvés.
7. Recharger la page pour vérifier la sauvegarde locale. Utiliser « Réinitialiser la démo » pour retrouver les données initiales avec de nouveaux délais.

Le scan, le déverrouillage et le contrôle au dépôt sont simulés. Une photo ou une position simulée est explicitement marquée comme telle. Le scénario de validation permet de démontrer l’état métier ; il ne constitue pas une vérification automatique réelle du véhicule.

## Identité visuelle

La direction visuelle reprend les captures Pony fournies et le [kit média officiel](https://getapony.com/presse#KIT-MEDIA) : violet `#321E64`, bleu roi `#321ED3`, cyan `#00FFFF`, corail `#FE6D80` et blanc. Les mots-symboles SVG blanc et violet proviennent du kit officiel.

DM Sans est incluse localement sous licence SIL OFL 1.1 comme approximation libre de la typographie ; elle n’est pas présentée comme la police exacte de l’application Pony. Les sources, licences et choix d’adaptation figurent dans [les références de marque](docs/BRAND_REFERENCES.md). Les captures fixes ne permettent pas de déterminer les animations d’origine ; les transitions du prototype sont des choix de réalisation et respectent la préférence de réduction des mouvements.

## Organisation

| Emplacement                   | Rôle                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| `src/App.jsx`                 | Navigation, carte, historique et revenus                      |
| `src/components/`             | Parcours d’exécution et formulaire de dépôt                   |
| `src/data/seed.js`            | Missions fictives, historique, tarifs et délais               |
| `src/domain/missions.js`      | Règles de transition, soumission et revue                     |
| `src/domain/storage.js`       | Sauvegarde locale versionnée et reprise après erreur          |
| `src/domain/date.js`          | Calendrier et affichage cohérents dans le fuseau Europe/Paris |
| `src/domain/missions.test.js` | Vérifications des règles et de la persistance                 |
| `docs/AI_DEVELOPMENT_LOG.md`  | Journal éditorial du développement assisté par IA             |
| `docs/discovery.md`           | Registre de discovery, sans conclusions inventées             |
| `docs/DEMO_RULES.md`          | Règles contractuelles et hypothèses de prototype              |
| `docs/BRAND_REFERENCES.md`    | Sources de marque, palette, typographie et limites de reproduction |

## Persistance et limites

La clé `pony-agent-demo:v1` de `localStorage` conserve les missions, le parcours en cours, les justificatifs et l’historique sur le navigateur utilisé. Les données ne sont pas partagées entre appareils. Une sauvegarde endommagée ou d’une version incompatible entraîne un retour à une démo initiale. Si le navigateur refuse l’écriture ou si le stockage est plein, l’interface reste utilisable en mémoire et affiche un avertissement.

Les dates et heures affichées utilisent le fuseau Europe/Paris. Les données initiales se créent relativement à l’heure de lancement pour conserver une démonstration utilisable ; leurs délais continuent ensuite de s’écouler. Réinitialiser la démo renouvelle ce point de départ.

La carte du prototype et les missions sont fictives. Aucun itinéraire de navigation réel, traitement serveur de photo, partage d’équipe, paiement ou contrôle anti-fraude n’est implémenté.

## Partie 2

Aucune fonctionnalité issue de discovery n’est construite avant réception des entretiens. Les réponses de Loïc, Karim, Inès et Thibault doivent d’abord alimenter le registre de preuves, les contradictions et la priorisation. L’échéance du dossier est le **19 novembre 2026 à 12 h, heure de Paris**.

Le journal conservé dans le dépôt est une synthèse traçable ; il ne remplace pas l’export intégral des conversations demandé pour la restitution finale.

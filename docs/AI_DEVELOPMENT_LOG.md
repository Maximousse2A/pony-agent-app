# Journal du développement assisté par IA

Ce document est un **journal éditorial des demandes, décisions et vérifications**. Il n’est pas un export verbatim de la conversation Codex. La conversation de travail reste la source originale à exporter pour la restitution finale. Les recherches d’authentification et les éventuels secrets n’ont pas vocation à être publiés.

## 12 novembre 2026 · Reprise du projet

### Demande de départ

Reprendre le projet de case study Pony ; vérifier l’existant ; initialiser React + Vite + Tailwind avec données mockées et localStorage ; préparer le dépôt `Maximousse2A/pony-agent-app`, un premier commit et GitHub Pages si les accès le permettent ; vérifier la compilation ; conserver le journal ; implémenter les parcours interactifs de Partie 1. Ne pas construire de fonctionnalité de Partie 2 avant les preuves issues des entretiens. Échéance : 19 novembre 2026, 12 h à Paris.

### Contexte récupéré

- Le fichier texte attaché au chat référencé a été lu. Il décrit quatre types de mission et sept parcours obligatoires.
- Le bref aperçu du chat précédent ne contenait que « Let’s go » et une pièce jointe ; il ne prouve ni la présence d’un dépôt ni un déploiement antérieur.
- Aucun résultat d’entretien n’a été fourni. Aucun constat opérationnel réel n’est inventé.

### Décisions d’architecture

- Application statique côté navigateur, sans backend ni authentification réelle, conformément au brief.
- Données fictives d’Angers ; dates initiales relatives à l’ouverture de la démo, conservées ensuite dans le navigateur.
- Séparation des données initiales, règles de mission, persistance et composants d’interface pour permettre une modification en direct à la restitution.
- Reducer central pour empêcher le scan d’un autre véhicule, l’envoi d’une mission incomplète et les doubles soumissions.
- Sauvegarde locale versionnée avec récupération après JSON invalide, version incompatible ou stockage refusé.
- Barème et délais conformes au brief ; pénalités du prestataire séparées des revenus individuels. Les montants de l’agent sont indicatifs dans cette démonstration.
- Parcours de dépôt avec photo et position, modes simulés visibles et résultats de validation pilotables pour démontrer attente, approbation et rejet.

### Travail réparti entre agents IA

L’agent principal intègre l’application et son interface. Un agent prépare le dépôt et le déploiement GitHub, un agent les données et règles de domaine, un agent le parcours de mission et le dépôt. Tous partagent les mêmes fichiers ; le journal ne présente pas ces agents comme des personnes interviewées.

### Vérifications déjà exécutées

- `npm test` : **6 tests réussis, 0 échec** lors de la vérification initiale du domaine.
- Couverture : tarifs des deux zones, délais, mauvais véhicule, progression bloquée si incomplète, justificatifs, soumission unique, rejet non payé, revue unique, quatre types de mission, reset, stockage corrompu ou refusé.
- Les vérifications de compilation, navigation, rendu et publication doivent être ajoutées ci-dessous avec leurs résultats observés. Aucun succès GitHub Pages n’est déduit de la seule présence d’un fichier de configuration.

### À compléter par l’intégration

Statut réel du dépôt, identifiant du commit, résultat du build, vérification navigateur et URL publiée : voir les observations finales de la session et les ajouts datés à ce journal. Ne pas transformer un accès manquant ou un déploiement en attente en livraison réussie.

### Vérification complémentaire · dates et reprise de sauvegarde

- Les jours de revenus, le début de semaine du lundi, le graphique et les dates de l’interface utilisent désormais explicitement **Europe/Paris**, quel que soit le fuseau de l’appareil.
- Trois tests couvrent le passage à minuit à Paris, le lundi parisien alors que l’UTC est encore dimanche et les semaines des changements d’heure de mars/octobre 2026.
- La revue du stockage a révélé un cas de sauvegarde partiellement corrompue : une position historique mal typée pouvait être acceptée puis provoquer une erreur d’affichage. La validation contrôle désormais aussi les preuves, les champs affichés et la cohérence du parcours ; une sauvegarde invalide revient à une démo initiale.
- Un objet photo vide n’est plus accepté comme justificatif à la soumission.
- `npm test` après ces corrections : **10 tests réussis, 0 échec**. Cette vérification reste distincte du test du rendu navigateur et du déploiement.

## Suite conditionnée aux entretiens

Les réponses de Loïc, Karim, Inès et Thibault alimenteront `docs/discovery.md`. L’analyse des problèmes, leur priorisation et l’implémentation d’une amélioration restent à faire après réception de ces éléments. La présente version couvre le socle de Partie 1 uniquement.

## 12 novembre 2026 · Intégration et essais navigateur

- Aucun ancien projet trouvé dans l’espace de travail ni dans la recherche locale bornée ; le dépôt cible renvoyait 404 avant création.
- Dépôt public créé et vérifié : https://github.com/Maximousse2A/pony-agent-app. GitHub Pages activé en mode GitHub Actions avec HTTPS ; publication encore à vérifier à ce stade du journal.
- Première compilation intégrée réussie ; vérification finale après mise en forme : **10 tests réussis, 0 échec**.
- Tests navigateur sur le prototype local : sélection depuis le plan ; erreur sur un identifiant de véhicule différent ; scan correct ; déverrouillage ; checklist d’intervention ; sauvegarde des cases cochées après rechargement ; photo de démonstration ; capture GPS indisponible et remplacement explicite par une position simulée ; dépôt en attente ; approbation depuis l’historique avec augmentation des gains.
- Second parcours : relocalisation, ajout effectif d’un fichier JPEG, position simulée, rejet « en dehors de la zone autorisée », motif retrouvé dans l’historique et montant payé à 0 €.
- Réinitialisation confirmée dans le navigateur : retour à 10 missions disponibles et à l’historique initial. Navigation vers les revenus et l’historique vérifiée.
- Rendu inspecté à 390 × 844 et à 1440 × 1000. Aucun débordement horizontal sur l’affichage ordinateur vérifié. Aucun message d’erreur ou avertissement console au contrôle.
- Lisibilité renforcée après inspection ; historique et revenus extraits dans des composants séparés. Le barème lit la source de données commune et le registre des gains détaille les montants par mission et par statut.
- Limites : géolocalisation réelle réussie non observée ; la demande automatique et le secours simulé ont été vérifiés. Les quatre types sont couverts par les tests de règles ; batterie et relocalisation ont aussi été parcourus de bout en bout dans le navigateur.
- Carte autonome schématique, sans service cartographique externe ; positions fictives et absence de navigation réelle signalées à l’écran. Aucun résultat d’entretien ajouté.

Références consultées : [Tailwind avec Vite](https://tailwindcss.com/docs/installation/using-vite) et [déploiement Vite sur GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages).

### Compilation finale vérifiée

- La compilation finale avec **Vite 7.3.8**, `@vitejs/plugin-react` **5.2.0** et Tailwind **4.3.5** a réussi : **87 modules**, **15,26 s**, sortie `dist/`.
- Des compilations intermédiaires ont été interrompues après blocage sans activité CPU. Une piste liée à Vite 8 a été examinée, mais Vite 7 présentait aussi le symptôme : la cause n’est donc pas attribuée avec certitude à Rolldown. Les traces Tailwind montraient la fin rapide de la génération CSS.
- L’inspection des fichiers ouverts montrait le chargement de centaines d’icônes inutilisées. Les imports passent désormais par les 36 points d’entrée publics des seules icônes utilisées, regroupés dans `src/components/icons.js`. La compilation a ensuite abouti ; le mécanisme exact du blocage local n’est pas présenté comme établi.
- L’installation des dépendances finales a signalé **0 vulnérabilité**. Les versions reproductibles sont conservées dans `package-lock.json`.

### Publication et validation après déploiement

- Premier commit applicatif : `17cf48da1e2a4b716613a8ba4731ba6f5a086e9c`, poussé sur `main`.
- [GitHub Actions 43210965005](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43210965005) : terminé avec succès, installation, tests, compilation et publication réussis.
- URL publiée vérifiée : https://maximousse2a.github.io/pony-agent-app/. HTML, favicon, CSS et JavaScript renvoient HTTP 200 ; les actifs JS/CSS correspondent octet pour octet au build local.
- La version de production locale a aussi été parcourue pour une récupération pour recharge jusqu’à approbation. La version publique a été parcourue pour un retour atelier jusqu’au dépôt en attente, avec photo et position simulées visibles dans l’historique. Les quatre types ont donc maintenant été parcourus dans le navigateur, en plus des tests de domaine.
- Version publique réinitialisée avant remise. Aucun avertissement ou erreur dans sa console au contrôle final. Captures téléphone et ordinateur conservées dans les livrables locaux.
- Voir `RELEASE_STATUS.md` pour l’état vérifié et les limites. Le brief privé et l’export des messages visibles sont conservés localement, en dehors du dépôt public. Le journal reste distinct d’un export intégral des conversations.

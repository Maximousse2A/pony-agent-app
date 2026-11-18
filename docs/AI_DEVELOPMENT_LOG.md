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

## 12 novembre 2026 · Adaptation à l’identité Pony

- Demande : reprendre la direction artistique de six captures fournies de l’application clients et adapter le prototype existant, notamment couleurs, typographie et transitions.
- Vérification du [kit média officiel Pony](https://getapony.com/presse#KIT-MEDIA) : palette exacte et vrais logos. Documentation des sources, droits et limites dans `BRAND_REFERENCES.md` ; originaux privés et code de parrainage absents du dépôt.
- Matter est identifiée sur le site officiel, sans preuve de la police embarquée dans l’app mobile. DM Sans variable sous SIL OFL est embarquée localement comme alternative proche ; elle n’est pas présentée comme la police officielle de l’app.
- Fond et en-têtes violets, actions bleues, accents cyan/corail, surfaces blanches, boutons en pilule, carte lavande, panneaux arrondis, titres plus lourds. Palette appliquée à la carte, aux missions, au dépôt, à l’historique et aux revenus.
- Transitions de panneaux, apparition du contenu et appui discret ajoutés ; réduction des animations prise en compte. Aucun mouvement exact n’est prétendu déduit des captures fixes.
- Échec temporaire d’ouverture locale : lecture d’un fichier de dépendance bloquée, observée dans un échantillon du processus. Réextraction propre par `npm ci`, puis aperçu démarré avec Node 24.22.3. Aucun défaut de Node/Vite/Tailwind n’est affirmé comme cause. Aucun mécanisme de signature système n’a été contourné.
- Les dix tests existants de domaine/dates passent. Parcours batterie rejoué dans le navigateur : scan incorrect/correct, déverrouillage, checklist, reprise après rechargement, preuves simulées, rejet motivé à 0 €. Reset et navigation vérifiés.
- Comparaisons côte à côte avec les sources et contrôle focalisé des actions conservés localement. Correction de l’identifiant coupé, du badge débordant à 320 px et des anciennes couleurs des repères. `design-qa.md` : `final result: passed`.
- La Partie 2 reste non construite ; aucune conclusion d’entretien n’est tirée des captures clients.

### Vérification avant publication de la DA

- `npm run build` exécuté avec Node 24.22.3 : succès, 87 modules, 607 ms. Sortie : `index-Ch6ICoFB.css` et `index-ZpnKr3aj.js`.
- Police WOFF2 et logos copiés dans `dist/` ; l’URL de police est préfixée pour GitHub Pages. Dans le navigateur, DM Sans est chargée et les actions principales ont un texte blanc sur le bleu officiel.
- Le dossier de preuves locales contient les comparaisons de référence/implémentation et les vues après correction. Aucun écran client privé n’est ajouté aux fichiers publiés.

### Publication de l’adaptation visuelle

- Commit applicatif : `d30a5dfe3a308147b28edd8c4161768d6cf98451`.
- [GitHub Actions 43248012207](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43248012207) terminé avec succès ; déploiement Pages `7741556361` sur ce même commit.
- HTML, favicon, JavaScript, CSS, police WOFF2 et les deux logos publiés répondent HTTP 200 et ont les mêmes empreintes SHA-256 que les fichiers locaux.
- Vérification publique dans le navigateur : nouvelle DA affichée sur la mission déjà sélectionnée, la carte et les revenus ; document et panneau de mission à 390 px sans débordement ; aucune erreur ni avertissement console. La police WOFF2 apparaît dans l’inventaire des ressources de la page.
- La mission active et les données du navigateur public ont été préservées ; aucun reset public effectué. La page publique précédemment ouverte a été rechargée pour montrer la nouvelle version.
- Les captures finales de la version publique restent dans les livrables locaux, hors du dépôt. README et état de livraison mis à jour dans un commit documentaire distinct.

## 13 novembre 2026 · Simplification des parcours terrain

### Demande et audit

- L’utilisateur demande une utilisation plus rapide dans la rue : moins d’étapes, plus d’informations immédiatement visibles, moins de texte décoratif et la photo au bon moment.
- La démarche [Unslop, créée par Damir Sokolovsky](https://github.com/heydamir/unslop), sous [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), est adaptée au design Pony existant. Les changements apportés concernent la hiérarchie opérationnelle, les parcours et les cibles interactives ; l’attribution et les observations sont conservées dans `FIELD_UX_REVIEW.md`.
- Audit avant modification à 390 × 844 px : première carte à y = 795,47 px, sous le début de navigation fixe à y = 774 px ; action de démarrage à y = 885,98 px ; envoi à y = 1 445,98 px. Le scénario de démonstration observé comptait 12 appuis dans l’application.
- Ces observations concernent le prototype. Aucun entretien ni mesure de performance terrain n’est inventé.

### Changements réalisés

- Liste compacte centrée sur le véhicule, la batterie, le délai, le départ, la destination et le montant. Les contenus de présentation sont réduits et les informations secondaires restent consultables.
- Parcours de mission en deux écrans : intervention, puis preuve de dépôt. Le scan correspondant et l’ouverture simulée partagent une action ; les trois conditions opérationnelles affichées sont ensuite confirmées explicitement par l’utilisateur.
- La confirmation propose immédiatement le sélecteur de photo, depuis un contrôle déjà monté et dans le geste utilisateur. La preuve reste récupérable après annulation ou retour à l’intervention. Le GPS est demandé à l’ouverture du dépôt ; les outils de simulation sont repliés.
- Action principale fixée en bas du panneau. Relevé local intermédiaire reçu à 390 px : bouton de 52 px de haut, première carte de mission de y = 555,30 à y = 710,20 px. Ces positions restent à reconfirmer au contrôle final.
- Les repères cartographiques proches sont regroupés selon la distance à l’écran et le zoom, avec sélection de l’identifiant exact dans la liste du groupe. Il s’agit d’une correction de cibles superposées dans la carte requise en Partie 1.
- `SCAN_AND_UNLOCK` et `CONFIRM_WORK` préservent les gardes du domaine, les anciennes sauvegardes et les preuves. Aucune étape d’intervention n’est attestée automatiquement au scan ou lors du chargement d’une photo.

### Résultats observés à ce stade

- **19 tests réussis, 0 échec, avec Node 24** : règles de mission, dates, nouveau parcours, reprise d’une sauvegarde ancienne, preuves conservées et regroupements cartographiques.
- Navigateur local, reprise d’une ancienne mission de récupération pour recharge : ouverture automatique du sélecteur, ajout et compression d’un fichier image, GPS de démonstration, rechargement avec preuves conservées, dépôt en attente puis approbation depuis l’historique. Le montant approuvé de **6 €** est retrouvé dans les revenus.
- Navigateur local, batterie : sélection du bon identifiant dans un groupe de carte, mauvais QR refusé, identifiant normalisé correct accepté, confirmation explicite des trois points puis photo et position simulées. Le rejet pour photo floue est retrouvé dans l’historique avec un montant payé de **0 €**.
- La caméra d’un smartphone n’a pas été testée et aucune capture GPS réelle réussie n’a été observée. La vérification d’un fichier image dans le navigateur ne constitue pas une validation de prise de vue sur appareil.
- Le build final, les mesures finales de la vue et des appuis, la revue QA et la publication de cette passe restent à confirmer. Aucun succès de CI ou de déploiement nouveau n’est déclaré ici.
- La Partie 2 reste non construite, en attente des entretiens et de la priorisation fondée sur leurs preuves.

## 14 novembre 2026 · Validation finale locale de la simplification

- Contrôle du build statique, distinct du serveur de développement : batterie puis relocalisation jusqu’au dépôt en attente ; preuve de relocalisation conservée après rechargement. Atelier aussi parcouru à 320 px jusqu’à approbation.
- Mesures finales 390 × 844 : carte de mission y = 555,30–710,20, navigation basse y = 772. Action de confirmation/photo y = 756,60–808,60 ; envoi y = 780–832. Les actions font 52 px de haut et restent dans la première vue.
- 7 appuis observés dans le scénario final avec photo/GPS de démo depuis la liste, contre 12 dans le relevé initial. Fenêtres système, défilement et scénarios d’erreur exclus ; aucun gain de temps réel revendiqué.
- Trois comparaisons avant/après des fichiers enregistrés ont été ouvertes et inspectées. La candidate a été corrigée pour réserver un bandeau aux contrôles de carte, remettre le focus au groupe après Échap et expliquer la reprise d’une mission déjà commencée.
- 19 tests de domaine réussis. Build final : 89 modules, 769 ms, `index-kEVaL-H9.js`, `index-CYIoeff2.css`. Aucun avertissement ni erreur dans la console de production locale finale.
- QA locale passée, avec limites d’appareil, de caméra, GPS et terrain précisées dans `design-qa.md`. Publication de cette passe à confirmer séparément dans l’état de livraison.

### Publication et contrôle public de la refonte terrain

- Commit applicatif `33d8e29aaa2e1cafdfd65324b1d2ba1b5f981445` poussé ; [GitHub Actions 43569675110](https://github.com/Maximousse2A/pony-agent-app/actions/runs/43569675110) terminé avec succès, installation, tests, compilation et déploiement inclus.
- Déploiement Pages `7784171652` associé à ce même SHA. HTML, favicon, JavaScript, CSS, police et deux logos répondent HTTP 200 et correspondent octet pour octet au build local.
- Contrôle public à 390 × 844 : nouveau code et CSS chargés, ancien parcours PN-3017 repris dans le nouveau design, document et panneau sans débordement, action basse visible. Navigation vers la carte puis les revenus vérifiée ; aucune erreur ni avertissement console.
- Aucun reset public effectué. Les données et la mission sélectionnée restent conservées ; les délais d’anciennes données continuent normalement de s’écouler.
- Publication et QA finale consignées dans l’état de livraison. Les captures et comparaisons avant/après restent hors du dépôt public.

## 18 novembre 2026 — Pony Smart et révision de la partie 2

Les relances aux quatre interlocuteurs conduisent à placer la traduction des besoins de disponibilité en missions ciblées avant les refus de dépôt. La justification complète et les limites des données sont dans `docs/PART2.md`. Le registre discovery et les points d’entrée README ont été corrigés.

Pony Express devient Pony Smart : tri terrain par défaut, choix lexicographique des missions selon les interventions critiques puis les dépôts ciblés, contrainte de service, échéance de dépôt distincte de la prise en charge, besoins omis visibles et scénario du soir isolé. Les preuves et revenus restent inchangés dans leur principe ; les reçus ciblés distinguent dépôt validé et présence future non mesurée. Les objectifs sont des hypothèses de pilote, pas des prévisions issues des taux de rétention.

Validation : 37 tests métier passés, build réussi, parcours local joué jusqu’à l’approbation simulée et revenus à 13,50 €. Blocage d’un dépôt estimé à 20 h 01 vérifié dans le navigateur ; reprise de la photo après rechargement vérifiée. Le HTML autonome a été copié dans `public/terrain/index.html`. Aucun push ni déploiement effectué dans cette passe.

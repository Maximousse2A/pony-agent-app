# PonyOps — Partie 2 : comprendre la sous-performance et améliorer l’application

18 novembre 2026 · Proposition pour le case study Product Manager, Internal Products & AI.

## Décision

Je priorise la traduction des besoins de disponibilité locale en missions ciblées, réalisables dans les horaires du prestataire. Pony Smart remplace la logique de maximisation des gains de Pony Express par une proposition de tournée qui privilégie les interventions critiques, puis les dépôts ciblés à une destination et une échéance précises.

La priorité n° 1 est la disponibilité au bon endroit et au bon moment. Elle structure la fonctionnalité principale présentée pour la partie 2. Les autres problèmes identifiés restent dans le diagnostic, avec leurs réponses déjà développées ou les investigations encore nécessaires.

La deuxième priorité est de faciliter le travail du prestataire et de la supervision : expliquer les refus, permettre de corriger une preuve sur place, simplifier les contestations et rendre la rémunération compréhensible. Ces améliorations restent une partie à part entière de PonyOps. Elles visent notamment à éviter que Karim doive reconstituer chaque dossier pour répondre aux agents. Leur effet sur le temps passé et le nombre d’appels reste à mesurer.

Ce choix ne repose pas sur une estimation chiffrée du manque à gagner : les données disponibles ne permettent pas cette comparaison. Il repose sur la convergence des entretiens et sur le lien direct entre les consignes données au prestataire et le résultat opérationnel attendu.

## 1. Ce que les quatre entretiens établissent

Les personnages et les chiffres appartiennent au cas. Les nouveaux échanges ont été transmis par Maxime le 18 novembre ; les références ci-dessous renvoient aux numéros des réponses dans ces échanges. Les éléments du premier tour proviennent de la synthèse PonyOps-restitution.md, version 2, et ne sont pas présentés comme une relecture de ses transcriptions originales.

| Source | Observation rapportée | Conséquence pour le diagnostic |
| --- | --- | --- |
| Loïc, réponses 2 et 6 | Le point semble dans la zone avant la photo, puis hors zone après, sans déplacement du véhicule selon lui. Aucun motif écrit. Contestation abandonnée car trop longue. Rémunération à la tâche validée ; préférence pour les missions groupées. | La décision est incompréhensible pour l’agent. Son choix de missions répond rationnellement à sa rémunération ; ce choix ne garantit pas la couverture des besoins de Pony. |
| Karim, réponses 2, 4, 6 et 10 | Aucune consigne de lieu ou d’heure, aucune zone de dépose prioritaire. Agents de 8 h à 17 h ou de 12 h à 20 h ; personne la nuit. 94 % de prise en charge annoncés pour un engagement de 90 %. | La performance contractuelle de prise en charge ne mesure pas la disponibilité locale. Le besoin de 7 h 30 ne peut pas être traité le matin même avec les horaires actuels. |
| Inès, réponses 2 et 4 | La supervision examine surtout les contestations. Elle ne voit ni les critères automatiques ni la liste exhaustive des motifs. | La personne qui révise les décisions manque de visibilité sur le contrôle initial. Les dossiers qu’elle voit ne constituent pas un échantillon représentatif de tous les dépôts. |
| Thibault, réponses 2 à 24 | Présence relevée à 7 h 30 seulement, dans six zones. Pas de durée de rupture ni de suivi local à 9 h. Flotte globale et rétention nocturne connues, mais pas le stock de 20 h. | Un diagnostic spatial et temporel est nécessaire. Les moyennes globales ne permettent pas de mesurer le service rendu dans chaque zone. |
| Thibault, réponses 26 et 28 | 55 % des refus portent sur la position ; détail des autres motifs et propriétaire de cette information inconnus. | Il faut clarifier la traçabilité et la responsabilité des décisions. Aucun défaut technique précis n’est démontré par ces agrégats. |

Au premier tour, Inès avait signalé des manques le matin et des tâches créées le soir. Karim estimait consacrer une heure par jour aux appels sur la paie. Loïc rapportait également des trajets perdus lorsque des usagers prenaient les véhicules avant son arrivée.

### Disponibilité : les périmètres à conserver

| Zone | Véhicules présents à 7 h 30, en moyenne | Part des véhicules déposés à 20 h encore présents à 7 h 30 |
| --- | ---: | ---: |
| Gare | 2 | 40 % |
| Campus 1 | 5 | 80 % |
| Campus 2 | 5 | 80 % |
| Hôpital | 7 | 80 % |
| Pôle du centre 1 | 6 | 60 % |
| Pôle du centre 2 | 5 | 60 % |

Les six valeurs de présence totalisent 30 véhicules en moyenne. Ce total ne représente ni toute la flotte louable, ni une mesure de demande non satisfaite. La flotte compte environ 1 200 véhicules, vélos et trottinettes confondus ; 85 % sont louables à 7 h 30 et en moyenne hebdomadaire. « Louable » ne signifie pas « présent au bon endroit ».

Le relevé du matin et la cohorte déposée à 20 h ont des dénominateurs différents. On ne peut pas calculer le stock de 20 h en divisant 2 par 40 %, ni faire une moyenne simple des taux de rétention pour toute la ville. Thibault attribue les départs de la gare aux derniers trains ; cette utilisation du soir a aussi une valeur pour les usagers.

Au premier tour : 6 % de tâches refusées à la dépose ; parmi ces refus, 55 % concernent la position ; parmi ces refus de position, 40 % sont contestés ; parmi ces contestations, 70 % sont accordées. Ce n’est pas 70 % de tous les refus. Le stade auquel les 6 % sont comptés et la régularisation effective de la rémunération restent à préciser.

## 2. Diagnostic et priorisation

**Diagnostic central : les besoins de disponibilité locale ne sont pas traduits en consignes partagées et en missions compatibles avec les horaires du prestataire.** Loïc optimise ses tâches validées, Karim respecte l’indicateur de prise en charge, tandis que Pony attend des véhicules aux lieux et heures utiles. Le lien causal avec chaque manque observé reste une hypothèse à tester ; le décalage des objectifs est directement documenté.

| Rang | Problème | Pourquoi ce rang | Limite / suite |
| --- | --- | --- | --- |
| 1 | Besoins de disponibilité non traduits en missions ciblées | Convergence agent, manager, supervision et analyste. Agir sur la consigne relie directement le travail demandé au résultat souhaité. | Pas de chiffrage de demande perdue ; horaires, cibles et coûts doivent être convenus. |
| 2 | Refus opaques et contestations trop coûteuses pour l’agent | Travail potentiellement non rémunéré, abandon des recours et sollicitations du manager. Le problème est tangible et traitable dans l’app. | Ni la précision GPS ni une autre cause technique ne sont prouvées comme cause de tous les refus. |
| 3 | Déplacements perdus vers des véhicules devenus indisponibles | Perte de temps rapportée par l’agent. | Quantifier fréquence et coût ; une réservation pourrait réduire l’offre aux usagers. |
| 4 | Charge de contrôle photo | Demande de la supervision ; possibilité d’améliorer la collecte des preuves et de cibler les revues. | 300 revues aléatoires hebdomadaires et 1 % de cas problématiques rapportés au premier tour ne suffisent pas à justifier une décision IA automatique. |
| 5 | Rentabilité des missions en périphérie | Peut expliquer une sélection des tâches et renforcer les écarts de couverture. | Mesurer coûts, trajets, moyens et rémunération ; une correction tarifaire ne se déduit pas des entretiens. |

La mesure locale insuffisante et l’absence de responsable identifié pour certaines règles sont des conditions à résoudre pour piloter les deux premières priorités. Le classement est un arbitrage produit qualitatif ; aucun score RICE ni ROI fictif n’a été ajouté.

### Pourquoi le choix a changé

Le premier tour documentait surtout les dépôts et la rémunération. Le second confirme ces irritants mais établit aussi l’absence d’objectifs localisés, l’absence de service avant 8 h et la faible rétention nocturne à la gare. Je fais donc passer la disponibilité ciblée devant les refus, même si le parcours de contestation était déjà développé.

La priorité de discovery ne remplace pas la gestion des incidents critiques : une intervention déjà classée critique conserve sa priorité dans une tournée.

## 3. Fonctionnalité ajoutée : Pony Smart

**Promesse : aider l’agent à réaliser les missions utiles à Pony, au bon endroit et dans un créneau réalisable, tout en rendant son tarif visible.**

- Accueil « Priorités terrain », tri Smart par défaut et consigne opérationnelle visible dans la fiche.
- Mission ciblée : destination imposée, heure limite de dépôt, créneau de disponibilité visé et motif.
- Tournée : interventions critiques, puis nombre de dépôts ciblés réalisables, puis autres missions. À couverture égale, durée totale minimale avant les gains. Cette règle est une proposition de pilote, pas une prévision de demande ou de revenu Pony.
- Contraintes : budget de temps, plage de couverture 8 h–20 h, délai contractuel de prise en charge et échéance distincte de dépôt. Une modification manuelle invalide la confirmation si elle dépasse ces contraintes.
- Besoins non couverts : une mission omise reste signalée. Le besoin de la gare à 7 h 30 n’est pas présenté comme couvert par une tournée du soir.
- Exécution : parcours existant conservé, consigne suivie jusqu’au reçu et objectifs archivés avec la preuve. Statuts approuvé, en attente et refusé restent distincts.
- Résultat : le suivi compte des dépôts et indique explicitement que la présence au créneau cible n’est pas mesurée. Un dépôt approuvé n’est pas une preuve de disponibilité le lendemain.

### Scénario du soir

Accessible depuis Pony Smart ou Démo, avec confirmation explicite de réinitialisation. Le scénario démarre le 16 novembre à 19 h. Deux missions fictives proposent un véhicule vers un campus et un vers l’hôpital avant 20 h, pour préparer le lendemain à 7 h 30. Selon le temps disponible, toutes les missions ne rentrent pas dans la tournée : l’omission est visible et le budget de 4 h ou 8 h ne permet pas de dépasser 20 h.

La gare reste signalée : avec 40 % de maintien entre 20 h et 7 h 30 et aucun agent avant 8 h, il faut convenir d’une organisation adaptée plutôt que promettre un résultat. Les taux de rétention n’ont pas été transformés en stocks prévus.

### Hypothèses et frontières du prototype

Les deux objectifs d’un véhicule, les adresses/coordonnées de démonstration, la limite de dépôt à 20 h et le renfort de journée à la gare avant 11 h sont des consignes pilotes fictives. Aucun stock cible optimal n’a été calculé. Les observations de rétention à 20 h ne garantissent pas le résultat d’un dépôt réalisé plus tôt.

Le calcul est déterministe et local. Il n’y a ni moteur de prévision IA connecté, ni console supervision, ni mission partagée entre agents, ni changement du contrat. Le service 8 h–20 h représente l’amplitude globale du prestataire ; l’horaire individuel et la capacité de transport restent à intégrer avant production. Les trajets restent des estimations, sans moteur routier. L’horloge de démonstration et les durées estimées ne sont pas une mesure du temps opérationnel réel.

Le parcours de refus conserve une IA et un support simulés. Une mise en production exigerait une validation des règles et un contrôle des erreurs ; aucune régularisation réelle n’est déclenchée.

## 4. Améliorations complémentaires conservées et valorisées

Pony Smart donne la direction opérationnelle ; le parcours terrain permet au prestataire d’exécuter les missions et de comprendre leur résultat. La priorité n° 1 ne supprime aucune des améliorations ci-dessous.

| Problème ou besoin | Réponse conservée dans le prototype | Bénéfice attendu et personnes concernées |
| --- | --- | --- |
| Refus sans explication | Motif écrit dans le reçu et accessible depuis l’historique ; distinction entre rejet et attente de vérification. | Loïc comprend la décision. Karim peut s’appuyer sur un dossier explicite plutôt que chercher l’origine du refus à chaque appel. Réduction des sollicitations à vérifier. |
| Preuve ambiguë découverte trop tard | Précision GPS visible, consigne photo contextualisée, possibilité de reprendre la photo ou le relevé avant de transmettre. | Loïc peut agir pendant qu’il est sur place. Inès reçoit des éléments potentiellement plus exploitables. Les alertes du prototype sont simulées. |
| Contestation trop longue, parfois abandonnée | Bouton de contestation réutilisant photo, position, précision et zone attendue ; chronologie conservant le refus initial et le résultat du réexamen. | Loïc n’a pas à reconstruire son dossier ; Karim et la supervision disposent d’un historique explicable. Le réexamen IA et le support sont simulés. |
| Rémunération difficile à comprendre | Tarif de mission, montant et statut visibles ; séparation des revenus approuvés, en attente et refusés ; calculs cohérents avec l’historique et ses périodes. | Loïc sait à quoi correspondent les montants. Karim peut avoir moins d’explications à fournir sur la paie ; aucun gain réel ni paiement effectif n’est revendiqué. |
| Parcours peu adapté au terrain | Trajet avant identification, guidage vers le véhicule et le dépôt, reprise de mission après ouverture du GPS, carte interactive et consignes par type d’intervention. | Moins d’ambiguïtés pour l’agent dans l’exécution. Le gain de temps terrain n’est pas encore mesuré. |
| Besoin d’organiser son travail et d’anticiper ses gains | Choix de durée, estimation du trajet et des tarifs, tournée modifiable. Ces éléments de Pony Express sont conservés dans Pony Smart avec un autre ordre de priorité. | Les contraintes et la rémunération de Loïc restent visibles dans une tournée orientée vers les objectifs de Pony. |

Ces fonctionnalités contribuent à plusieurs problèmes du classement : la collecte des preuves soutient également la supervision, et les durées/tarifs rendent les arbitrages du prestataire plus lisibles. Elles ne suffisent pas à revendiquer la résolution des trajets vers un véhicule devenu indisponible, l’automatisation complète des contrôles photo ou la rentabilité de la périphérie. Ces sujets restent explicitement au backlog.

### Ce que nous mesurerions pour le prestataire

- **Karim :** nombre d’appels liés aux refus ou à la paie pour 100 missions, et temps quotidien consacré à les expliquer. Son estimation d’une heure par jour est un point de départ déclaratif à confirmer.
- **Loïc :** compréhension du motif et du montant, temps nécessaire pour déposer un recours, abandons de recours recueillis par entretien, possibilité de corriger sur place.
- **Inès :** part des dossiers exploitables dès réception, temps de traitement et volume de sollicitations ; surveiller les validations erronées.

## 5. Conditions de réussite et pilote

1. **Définir le service attendu.** Avec les opérations et Karim, fixer des objectifs par lieu et créneau, les moyens disponibles, les horaires, les responsabilités et le traitement des besoins non couverts. Aucune pénalité individuelle ou modification tarifaire automatique.
2. **Mesurer la situation initiale.** Relever la disponibilité locale à intervalles réguliers entre 7 h et 9 h, les éventuelles recherches sans véhicule, les arrivées/départs et le stock des zones de prélèvement. Distinguer vélos et trottinettes lorsque les données le permettent.
3. **Tester à petite échelle.** Choisir des zones selon le besoin mesuré et la faisabilité. Comparer des jours/créneaux comparables, idéalement avec zones témoins, en contrôlant météo et événements. Les campus et l’hôpital sont des candidats, pas une priorité automatique déduite de leur seule rétention.
4. **Vérifier le résultat.** Mesure principale : part des observations du créneau où le nombre de véhicules louables atteint la cible convenue. Suivre également minutes sans véhicule et signaux de demande non satisfaite lorsque disponibles.
5. **Surveiller les compromis.** Coût par véhicule utile au créneau cible, trajets, dépassements horaires, rémunération des agents, disponibilité dans les zones de prélèvement, incidents et taux de dépôts contestés. Fixer les seuils de succès après mesure initiale, avant lancement du pilote.

Pour les refus, suivre séparément refus initiaux et définitifs, motif, recours abandonnés via entretiens, délai de décision et régularisation ; documenter le responsable du contrôle automatique.

## 6. Démonstration en entretien

1. Ouvrir Missions : montrer « Priorités terrain », puis Pony Smart et l’ordre de décision.
2. Charger la préparation du soir après confirmation de réinitialisation. Montrer les missions proposées et les besoins non couverts ; expliquer le cas spécifique de la gare.
3. Ajouter la mission omise : montrer que la confirmation est bloquée si le dépôt dépasse 20 h. Retirer cette étape pour retrouver une tournée réalisable.
4. Confirmer, accepter une mission ciblée et dérouler trajet, identification, intervention et dépôt. Montrer destination, échéance et motif.
5. Soumettre la preuve, ouvrir le reçu puis l’historique et les revenus. Une mission en attente reste exclue des revenus approuvés ; une approbation simulée ne compte le montant qu’une fois.
6. Montrer aussi la deuxième priorité : après réinitialisation de la journée, ouvrir Historique → Rejetées → Rue des Carmes. Lire le motif, montrer les preuves conservées et lancer la contestation simulée. Expliquer en quoi ce dossier lisible peut réduire le temps d’explication de Karim, sans annoncer de gain déjà mesuré.
7. Conclure sur les deux résultats recherchés : améliorer la disponibilité pour Pony et faciliter l’exécution, la compréhension et le suivi pour les prestataires. Distinguer dépôt approuvé et présence demain non mesurée, puis présenter les mesures du pilote.

## Formulation orale

« J’ai d’abord priorisé les refus de dépôt, parce que les quatre entretiens documentaient un problème de validation et de rémunération. Les relances ont changé mon diagnostic : le prestataire respecte son indicateur de prise en charge, mais ne reçoit aucun objectif de disponibilité par lieu et par heure, et ses agents ne commencent qu’à 8 h. J’ai donc fait évoluer Pony Express, centré sur les gains de l’agent, en Pony Smart : une tournée qui traduit les besoins de Pony en consignes ciblées et réalisables. Elle montre aussi ce qu’elle ne couvre pas, notamment la gare à 7 h 30. En parallèle, je conserve les motifs de refus explicites, les preuves réutilisables, les contestations simples et la lisibilité des revenus : ces améliorations aident Loïc et visent à réduire le temps que Karim passe à expliquer les décisions. La disponibilité reste la priorité n° 1 ; l’efficacité du prestataire reste un objectif du produit. Un pilote devra mesurer ces deux effets et leurs coûts. »

## Vérification de cette livraison

- 37 tests métier passent : parcours existants, revenus et calendriers, choix Smart face à un tarif supérieur, interventions critiques, fin de service, échéance de dépôt, étapes omises, persistance et unicité des contributions.
- Compilation Vite et génération du HTML autonome réussies. Un avertissement de taille du bundle demeure ; aucune erreur de compilation.
- Dans le navigateur local : passage au scénario du soir, ajout d’une étape finissant à 20 h 01 avec confirmation désactivée, retrait et confirmation d’une tournée valide, mission ciblée jusqu’au dépôt, reprise après rechargement avec photo, passage en attente puis approbation simulée et revenus approuvés à 13,50 €.
- Aucune erreur console relevée pendant ce parcours. L’inspection concerne le navigateur local ; elle ne constitue pas une certification iPhone/Android ou une mesure terrain.
- Publication de Pony Smart et de la connexion de démonstration réussie le 18 novembre : commit `abbb6fe54988c1aadd9ef4b18ae9ef7c6bf2b669`, workflow GitHub Actions `44319571783`. Le HTML public a été comparé au build local. La présente clarification de la restitution ne modifie pas l’application.

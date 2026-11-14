# Revue de l’usage terrain · 13 novembre 2026

## Besoin et périmètre

L’utilisateur demande une application plus rapide à utiliser dans la rue : moins d’écrans et d’appuis, les informations utiles visibles immédiatement, moins de texte décoratif et la photo proposée au moment du dépôt.

Cette passe améliore les parcours obligatoires de **Partie 1**. Elle conserve l’identité Pony déjà documentée, les missions, les preuves, l’historique et les revenus. Aucune conclusion d’entretien ni fonctionnalité de Partie 2 n’est introduite.

## Audit initial mesuré

L’agent principal a inspecté le parcours dans le navigateur avant modification, à **390 × 844 px**. Les valeurs ci-dessous sont les positions verticales relevées dans cet état de référence ; elles ne décrivent pas la nouvelle interface.

| Observation avant modification                      |  Mesure relevée | Conséquence                                                                         |
| --------------------------------------------------- | --------------: | ----------------------------------------------------------------------------------- |
| Haut de la première carte de mission                |   y = 795,47 px | La carte commence sous le début de la navigation fixe, situé à y = 774 px           |
| Action pour commencer la mission                    |   y = 885,98 px | L’action principale est hors de la première vue                                     |
| Action d’envoi du dépôt                             | y = 1 445,98 px | La photo, le GPS et les choix de démonstration éloignent l’envoi de la zone visible |
| Parcours de démonstration compté dans l’application |       12 appuis | Plusieurs validations et changements d’écran s’ajoutent au travail terrain          |

Le comptage concerne le scénario observé dans l’application. Il ne mesure ni le temps d’une intervention réelle ni le nombre d’actions dans les fenêtres système de caméra ou de permission GPS. Aucun gain de temps terrain n’est déduit de cette seule observation.

La carte présentait aussi des cibles de véhicules proches qui se recouvraient : pendant l’audit, un clic visant le repère PN-2841 a ouvert PN-2916. Ce comportement appelle une vérification de sélection exacte, au-delà d’un changement de couleurs ou de textes.

## Choix de réalisation

### Deux écrans pour la mission

1. **Intervention** : identifiant du véhicule, type de mission, montant, batterie, échéance de prise en charge et destination. Une action regroupe le scan QR et l’ouverture simulés.
2. **Preuve de dépôt** : photo du véhicule en place, état de capture GPS et envoi. Les commandes de démonstration restent disponibles dans une section repliable.

Les trois conditions propres au type de mission restent affichées avant la confirmation. L’action « Terminé, prendre la photo » exprime une affirmation explicite de leur réalisation. Le code ne les déclare pas réalisées au scan, à l’ouverture de l’écran ou à la réception d’une photo.

Le motif et la date de création restent consultables, avec les informations secondaires dans des sections dépliables. Les éléments de décoration et les messages génériques sont réduits pour donner la priorité au véhicule, au lieu et à l’action attendue.

### Photo et GPS au moment utile

L’entrée de fichier reste montée pendant le parcours ; la demande de photo peut donc partir du clic de confirmation, dans le même geste utilisateur. L’annulation de la caméra laisse l’écran de preuve ouvert avec une action photo explicite. Une photo déjà présente est conservée lorsqu’on revient à l’intervention.

La capture GPS démarre à l’ouverture du dépôt. Son état est visible ; une erreur donne accès au nouvel essai et à une position de démonstration clairement indiquée. Les justificatifs simulés et le résultat simulé sont regroupés dans les outils de démo.

### Carte et sélection exacte

Les marqueurs de 48 px sont regroupés lorsque leurs centres affichés sont séparés de moins de 56 px. Le calcul prend en compte la taille réelle de la carte et son zoom. Chaque groupe conserve ses missions et ouvre une liste de véhicules identifiés, avec leur lieu et leur montant. Le centre du groupe est calculé à partir des positions originales ; les regroupements sont répétés jusqu’à ce que les centres finaux soient séparés.

Ce regroupement corrige les cibles superposées d’un parcours cartographique déjà requis en Partie 1. Il ne propose ni tournée optimisée, ni dispatch automatique, ni solution prioritaire issue de discovery. Toutes les missions restent également accessibles dans la liste.

## Contrat métier et reprise de sauvegarde

- `SCAN_AND_UNLOCK` exige l’identifiant normalisé correspondant à la mission et agit depuis les anciens états de détail ou de scan.
- `CONFIRM_WORK` exige `confirmed: true`, un scan valide et un véhicule ouvert. Il fonctionne depuis l’intervention ou un ancien scan déjà déverrouillé.
- L’envoi conserve ses conditions : intervention confirmée, photo valide et position valide. Les résultats en attente, approuvés et rejetés, la revue et le calcul des revenus sont conservés.
- Le schéma de stockage et les anciens états sont conservés. Une sauvegarde de checklist partielle attend une nouvelle confirmation explicite ; un dépôt déjà préparé conserve sa photo et sa position.
- Les actions composées répétées depuis le dépôt sont sans effet. Les requêtes de photo et de GPS sont protégées contre une réponse tardive après fermeture ou changement de mission.

La série de tests de domaine exécutée avant cette revue statique comporte **19 tests réussis avec Node 24**, dont les nouveaux parcours et le regroupement cartographique. Aucun test n’a été relancé pendant cette revue de code. La vérification finale de l’interface et de la publication reste à consigner ci-dessous.

## Points à vérifier à l’intégration

La revue statique confirme la cohérence entre la projection du plan, la taille observée du conteneur, le zoom et le calcul des regroupements. La confirmation d’une ancienne sauvegarde de détail déjà déverrouillée passe d’abord par l’état d’intervention, sans supprimer les preuves.

Trois cas demandent une attention dans le navigateur :

- Lorsqu’une intervention est déjà commencée, sélectionner un autre véhicule rouvre la mission en cours. Cette protection de la progression doit être compréhensible pour éviter une impression de mauvais véhicule sélectionné.
- La liste d’un groupe cartographique doit recevoir un focus utile et pouvoir être fermée au clavier, sans imposer un parcours dans des marqueurs masqués.
- Au bord de la carte et après zoom, vérifier que les cibles restent utilisables ; la liste des missions demeure le moyen d’accès complet.

Ces points sont des vérifications d’intégration, pas des résultats de tests utilisateur.

## Contrôles locaux reçus en cours d’intégration

- Ancienne récupération pour recharge reprise dans le navigateur : sélecteur de fichier ouvert automatiquement à la confirmation, image ajoutée et compressée, position de démonstration, preuves conservées après rechargement, dépôt en attente puis approbation. Le montant de 6 € apparaît dans les revenus approuvés.
- Batterie : choix du bon identifiant dans le groupe de carte, mauvais QR refusé, QR normalisé accepté, confirmation explicite puis photo et GPS simulés. Le rejet « photo floue » donne un montant payé de 0 € dans l’historique.
- Relevé local intermédiaire à 390 px : première carte de y = 555,30 à y = 710,20 px, contre y = 795,47 px pour son début avant modification ; action fixe de 52 px de haut. Mesure confirmée sur le build statique final.

Les contrôles finaux locaux sont maintenant consignés dans [design-qa.md](../design-qa.md). La caméra d’un smartphone et une capture GPS réelle réussie restent non testées. Le parcours final de démo compte 7 appuis dans l’application depuis la liste, contre 12 au relevé initial ; le détail et les exclusions figurent dans la QA. Cela ne constitue pas une mesure de temps terrain.

## Attribution et adaptation

Cette passe reprend et adapte la démarche **[Unslop](https://github.com/heydamir/unslop), créée par Damir Sokolovsky**, publiée sous licence **[Creative Commons Attribution 4.0 International — CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. Adaptation réalisée le 13 novembre 2026 pour les parcours d’agents terrain dans le design Pony existant : hiérarchie opérationnelle, réduction des écrans, actions au moment utile et revue des cibles interactives.

Les choix propres au prototype et leurs modifications sont décrits dans cette note. Cette attribution ne suppose aucun soutien de l’auteur au projet. Les logos Pony et la police DM Sans conservent les provenances et conditions indiquées dans [BRAND_REFERENCES.md](BRAND_REFERENCES.md).

## Vérification finale locale · 14 novembre 2026

- 19 tests réussis ; build de production réussi, 89 modules, 769 ms sous Node 24.22.3.
- Documents à 320/390/1440 px sans débordement horizontal ; intervention et preuve à 320/390 px avec action basse visible, haute de 52 px.
- Sélection exacte dans un groupe et d’un véhicule isolé, zoom, focus et Échap vérifiés. Les contrôles cartographiques disposent de leur propre bandeau.
- QR incorrect refusé ; confirmation explicite et preuves exigées. Ancienne mission de recharge reprise, import d’un fichier image et preuves conservées après rechargement.
- GPS refusé par le navigateur et secours simulé vérifiés ; caméra smartphone réelle et capture GPS réelle réussie restent à tester.
- Dépôts en attente, approuvés, rejetés, historique et revenus vérifiés ; rejet à 0 € avec motif.
- Aucune erreur ni avertissement dans la console du build final. Préférence de réduction des mouvements prise en charge par le CSS inspecté.

L’[état de livraison](RELEASE_STATUS.md) porte le commit exact, l’exécution GitHub Actions, les ressources HTTP et le contrôle du navigateur public. Ces preuves de publication sont distinctes des contrôles locaux ci-dessus.

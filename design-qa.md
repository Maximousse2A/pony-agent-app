# Design QA · Usage terrain

Audit commencé le 13 novembre, validation locale terminée le **14 novembre 2026**. Passe appliquant [Unslop de Damir Sokolovsky](https://github.com/heydamir/unslop), CC BY 4.0, à la demande de simplification terrain. La précédente adaptation Pony est archivée dans [la QA de marque](docs/DESIGN_QA_BRAND_2026-11-12.md).

## Référence, contexte et preuves

- Produit existant React/Vite, Partie 1 uniquement. Identité Pony, logo officiel et DM Sans conservés ; les surfaces et textes passent à une gamme neutre, avec le bleu Pony pour l’action et la sélection.
- Captures fraîches avant modification : `../../work/field-ux/before/`, cinq vues à 390 × 844 px, de la liste au dépôt. Aucun accès à une app Pony réelle ni donnée d’entretien inventée.
- Captures après : `../../work/field-ux/after/`, développement puis build statique local servi sur le port 4173. Les captures de production finales ont été enregistrées dans les livrables locaux, hors dépôt public.
- Comparaisons exactes ouvertes et inspectées : `../../work/field-ux/comparison-1.jpg`, `comparison-2.jpg`, `comparison-3.jpg`. Chaque paire conserve 390 × 844 px sans étirement ; les missions et dates fictives peuvent différer entre les scénarios. Les vérifications visuelles concernent la structure, pas une égalité des données.
- Ordinateur 1440 × 1000 et téléphone étroit 320 × 740 aussi inspectés. Cette passe compte une version candidate et une version corrigée après le relevé de référence.

## Constats et corrections

| Constat initial                                                                                        | Correction et résultat observé                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Aucun véhicule complet visible avant la navigation basse ; première carte à y = 795,47                 | En-tête direct, statistiques et slogans retirés. Dans le build final : première carte à y = 555,30–710,20 ; navigation à y = 772. Une mission complète est visible sans défiler.     |
| Actions pour commencer et envoyer hors écran, à y = 885,98 et 1445,98                                  | Panneau avec un seul contenu défilant et action basse indépendante. À 390 × 844 : confirmation/photo y = 756,60–808,60 ; envoi y = 780–832. Hauteur de chaque action : 52 px.        |
| Quatre écrans, trois cases séparées et nombreuses validations                                          | Deux écrans : intervention et preuve. Scan/ouverture regroupés ; trois points métier toujours affichés, confirmés explicitement avec le bouton qui ouvre la photo.                   |
| Batterie et destination à chercher dans différents écrans                                              | Liste : identifiant, type, montant, lieu de départ, destination, batterie visuelle et délai. Intervention : mêmes repères, avec création et motif dépliables.                        |
| Un clic visant PN-2841 ouvrait PN-2916 à cause du recouvrement des repères                             | Groupes calculés en pixels ; choix exact PN-2841 vérifié dans la liste du groupe. Tests de séparation, conservation et stabilité des missions.                                       |
| Première version candidate : contrôles du plan devant un véhicule                                      | Bandeau propre aux contrôles et marge intérieure. Repères de 48 px, sans contrôle devant eux à zoom initial. Le zoom peut sortir des positions du cadre ; la liste reste exhaustive. |
| Première version candidate : retour du focus du groupe tenté pendant que le repère était encore inerte | Retour après rendu. Ouverture, focus sur un véhicule, Échap et retour au groupe vérifiés dans la version corrigée.                                                                   |
| Sélection d’un autre véhicule pendant une intervention ambiguë                                         | Message explicite indiquant le véhicule déjà commencé ; choix de terminer ou libérer dans Options. Progression conservée.                                                            |
| Confirmation de libération potentiellement hors du défilement                                          | Défilement et focus sur « Garder la mission » ; contrôle visible et bouton principal désactivé tant que la confirmation est ouverte.                                                 |

## Parcours et vérifications

- Scan erroné refusé ; code correct avec espaces/minuscules normalisé et accepté. Scan et déverrouillage restent explicitement simulés.
- Ancienne mission de recharge déverrouillée reprise ; confirmation, ouverture du sélecteur de fichier depuis le même clic, fichier image importé et préparé, GPS de démo ; photo et position conservées après rechargement.
- Dépôt en attente, revue simulée approuvée et montant de 6 € retrouvé dans les revenus.
- Batterie : confirmation des trois points, photo et GPS de démo, rejet avec motif de photo floue, historique à 0 €.
- Atelier : parcours sur 320 px jusqu’à approbation à 6 €. Dans le build de production : batterie et relocalisation jusqu’au dépôt en attente, preuve conservée après rechargement.
- Parcours complet de démo final : **7 appuis dans l’application** depuis la liste (sélection, scanner/ouvrir, terminer/photo, outils de démo, photo de démo, GPS de démo, envoyer). Le relevé initial en comptait 12. Fenêtres système, défilement, tests d’erreur et réinitialisation exclus ; ce n’est pas une mesure de temps terrain. Passer par un groupe de carte ajoute un choix de véhicule.
- Aucun débordement horizontal observé du document à 320, 390 et 1440 px ; panneau d’intervention et formulaire de preuve à 320 et 390 px. Actions basses visibles dans ces deux dimensions mobiles.
- Cibles principales et repères de 48 px ou plus ; action primaire de 52 px. Informations chiffrées alignées, labels et statuts présents ; la couleur ne porte pas seule l’information.
- Écrans de production locale finaux : aucun avertissement ni erreur console observés. Une erreur d’icône pendant le développement a été corrigée avant ces contrôles et avant le build final.
- Blanc sur bleu Pony : contraste environ 9,28:1. Texte principal #171717, secondaire #525252, légendes #737373 sur blanc. Focus clavier visible. Règle `prefers-reduced-motion` conservée et inspectée dans le CSS ; préférence système non changée pour ce contrôle.
- 19 tests de domaine réussis ; build Node 24.22.3 / Vite 7.3.8 réussi : 89 modules, 769 ms, sorties `index-kEVaL-H9.js` et `index-CYIoeff2.css`.

## Limites acceptées

Pas de test avec un agent dans la rue, soleil, gants ou réseau mobile. L’ouverture du sélecteur et l’import ont été vérifiés ; une prise de vue réelle sur smartphone et une capture GPS réelle réussie ne l’ont pas été. Le navigateur a refusé le GPS ; le secours clairement simulé a été testé. L’API de test n’a pas permis d’annuler le sélecteur natif avec une liste vide ; la présence du bouton de reprise photo sans fichier a été constatée, sans déclarer une annulation native testée.

Carte schématique et positions fictives. Scan, ouverture et validation du dépôt restent simulés. La fonctionnalité de Partie 2 demeure non construite ; le regroupement corrige les cibles de la carte obligatoire, sans optimisation de tournée ou conclusions d’entretien.

Aucun constat bloquant de cette passe ne reste ouvert après correction et contrôle local. La publication a aussi été vérifiée séparément : commit `33d8e29`, exécution GitHub Actions `43569675110` réussie, déploiement Pages `7784171652`, ressources publiques identiques au build local et navigateur public sans avertissement ni erreur. L’ancienne mission sélectionnée a été conservée ; carte et revenus inspectés. Voir [l’état de livraison](docs/RELEASE_STATUS.md).

final result: passed

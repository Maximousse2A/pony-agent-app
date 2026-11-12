# Règles et hypothèses du prototype

## Éléments fournis par le brief

| Mission                    | Centre-ville | Périphérie | Délai de prise en charge |
| -------------------------- | -----------: | ---------: | -----------------------: |
| Changement de batterie     |       2,50 € |     2,00 € |                      4 h |
| Relocalisation             |       4,00 € |     3,50 € |                      6 h |
| Récupération pour recharge |       7,00 € |     6,00 € |                      4 h |
| Retour à l’atelier         |       6,00 € |     6,00 € |                     24 h |

Le prestataire doit prendre en charge au moins 90 % des tâches dans les délais mensuels. En dessous, une pénalité de 5 % s’applique à sa facture. Le taux de rejet au dépôt doit rester inférieur à 8 %. Une tâche rejetée n’est pas payée.

Ces règles de performance portent sur le prestataire. Le prototype ne calcule pas de pénalité individuelle pour l’agent et n’invente pas de performance mensuelle réelle à partir du petit échantillon de démonstration.

## Hypothèses de démonstration, à confirmer

- Les missions se déroulent à Angers. Les véhicules, motifs, positions, historiques et résultats sont fictifs.
- Le tarif de mission fourni est utilisé comme montant indicatif dans l’écran des revenus. Le contrat réel de rémunération de l’agent n’a pas été fourni.
- Trois étapes manuelles par type de mission servent de preuve d’exécution dans la démo. Le processus opérationnel exact reste à confirmer.
- La photo et une position sont obligatoires pour envoyer un dépôt dans le prototype. Elles peuvent être explicitement simulées.
- Les rejets proposés illustrent une photo inexploitable, une position non conforme ou une intervention incomplète. Ce sont des scénarios de validation plausibles, pas des résultats d’interviews ni des seuils opérationnels découverts.
- Le choix d’un résultat au dépôt et les boutons de revue dans l’historique sont des commandes de démonstration. La supervision et la reconnaissance d’image ne sont pas connectées.
- « En attente » signifie non encore approuvée. « Approuvée » contribue aux revenus approuvés. « Rejetée » représente une valeur non payée et ne contribue pas aux revenus approuvés. Une mission ne peut être revue qu’une fois.

## Vérifications automatisées

Les tests de domaine vérifient les tarifs et délais, le refus d’un mauvais scan, l’ordre des étapes, les justificatifs obligatoires, l’absence de double soumission ou double revue, le traitement des rejets, les quatre types de mission, le reset et les erreurs de stockage. Les tests ne vérifient pas visuellement l’interface ni le GPS physique d’un appareil.

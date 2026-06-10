# Grille QA des classeurs conseil (livrables tableurs / modèles)

## Catégories d'évaluation

Le réviseur QA évalue les livrables tableurs et modèles conseil sur huit dimensions. Chaque catégorie reçoit un score de 0 à 100 et contribue à l'évaluation globale de préparation associé.

| Catégorie | Code | Poids |
|----------|------|-------|
| Formules | FM | 20 % |
| Analyse | AN | 20 % |
| Sources | SR | 15 % |
| Hypothèses | AS | 10 % |
| Cohérence | CN | 10 % |
| Sensibilité | SV | 10 % |
| Insight | IN | 10 % |
| Structure | ST | 5 % |
| **Total** | — | **100 %** |

---

## Formules (FM)

### Définition

Les Formules évaluent si les calculs sont mécaniquement corrects, exempts de valeurs d'erreur et construits avec une logique de formule saine plutôt que des valeurs codées en dur.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| FM1 – Excellent | 90–100 | Toutes les formules calculent correctement sans valeur d'erreur ; les calculs référencent des cellules d'entrée plutôt que des nombres codés en dur. |
| FM2 – Acceptable | 70–89 | Les calculs sont corrects ; des valeurs d'erreur isolées ou des codages en dur existent mais n'affectent pas les sorties. |
| FM3 – Faible | 50–69 | Plusieurs erreurs de formule ou valeurs codées en dur dans des cellules de calcul ; certaines sorties nécessitent une vérification. |
| FM4 – Insuffisant | <50 | Des erreurs de calcul ou des références rompues affectent matériellement les sorties. |

### Règles de détection LLM

Signaler un problème de Formules lorsque :

- Des cellules contiennent des valeurs d'erreur (#REF!, #DIV/0!, #N/A, #VALUE!, #NAME?).
- Des nombres codés en dur sont intégrés dans des formules de calcul plutôt que dans des cellules d'entrée.
- Une formule référence la mauvaise cellule, plage ou feuille.
- Des fonctions logiques ou de recherche renvoient des résultats inattendus (p. ex. recherche approximative sur données non triées).

---

## Analyse (AN)

### Définition

L'Analyse évalue si les conclusions tirées du tableur sont valides, bien raisonnées et directement étayées par les calculs et données sous-jacents.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| AN1 – Excellent | 90–100 | Les conclusions découlent directement des données ; le raisonnement est solide et sans incohérence logique. |
| AN2 – Acceptable | 70–89 | Les conclusions sont généralement étayées ; des lacunes mineures de raisonnement existent sans compromettre la constatation. |
| AN3 – Faible | 50–69 | Les conclusions ne sont que partiellement étayées par les données ; des lacunes de raisonnement importantes sont présentes. |
| AN4 – Insuffisant | <50 | Les conclusions contredisent ou ne sont pas étayées par les données et sorties sous-jacentes. |

### Règles de détection LLM

Signaler un problème d'Analyse lorsque :

- Une conclusion énoncée n'est pas étayée par les sorties du modèle.
- La méthode analytique choisie est inadaptée à la question posée.
- Des relations de cause à effet sont affirmées mais non démontrées par les données.
- Les constatations d'une section contredisent celles d'une autre.

---

## Sources (SR)

### Définition

Les Sources évaluent si les entrées, références et affirmations intégrées au classeur sont étayées par des références crédibles, actuelles et traçables.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| SR1 – Excellent | 90–100 | Toutes les entrées et références matérielles sont sourcées ; les sources sont crédibles et actuelles. |
| SR2 – Acceptable | 70–89 | La plupart des entrées sont sourcées ; des affirmations non sourcées mineures sont présentes sans affecter les conclusions. |
| SR3 – Faible | 50–69 | Plusieurs entrées matérielles manquent de sources ; les références sont minces, vagues ou obsolètes. |
| SR4 – Insuffisant | <50 | Des entrées clés sont présentées sans aucune source citée. |

### Règles de détection LLM

Signaler un problème de Sources lorsque :

- Une entrée ou référence matérielle apparaît sans source citée.
- Une note de source renvoie à un document ou une page introuvable.
- Les données citées sont obsolètes par rapport à la portée de l'analyse.
- Un chiffre de marché ou sectoriel est énoncé sans attribution.

---

## Hypothèses (AS)

### Définition

Les Hypothèses évaluent si les hypothèses de leviers clés sont explicitement énoncées, isolées des calculs et raisonnables dans le contexte de l'analyse.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| AS1 – Excellent | 90–100 | Toutes les hypothèses matérielles sont explicitées, isolées dans des cellules d'entrée dédiées et justifiées. |
| AS2 – Acceptable | 70–89 | La plupart des hypothèses sont identifiables ; certaines ne sont que partiellement justifiées ou pas totalement isolées. |
| AS3 – Faible | 50–69 | Plusieurs hypothèses restent implicites ou sont intégrées dans des cellules de calcul. |
| AS4 – Insuffisant | <50 | Des hypothèses critiques sont manquantes ou impossibles à identifier. |

### Règles de détection LLM

Signaler un problème d'Hypothèses lorsque :

- Les sorties dépendent d'hypothèses nulle part énoncées.
- Des valeurs d'entrée sont intégrées dans des formules plutôt que dans des cellules distinctes.
- Une hypothèse contredit les preuves disponibles ou le contexte client.
- Des taux de croissance, multiples ou taux apparaissent sans justification.

---

## Cohérence (CN)

### Définition

La Cohérence évalue si les chiffres se réconcilient en interne : les totaux correspondent à leurs composantes, les références inter-feuilles concordent, et les unités, périodes et signes sont appliqués uniformément.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| CN1 – Excellent | 90–100 | Tous les totaux se réconcilient ; les références inter-feuilles concordent ; unités, périodes et signes sont cohérents partout. |
| CN2 – Acceptable | 70–89 | Écarts d'arrondi mineurs uniquement ; aucun impact sur les conclusions. |
| CN3 – Faible | 50–69 | Plusieurs incohérences entre feuilles ou sections nécessitent vérification. |
| CN4 – Insuffisant | <50 | Les chiffres ne se réconcilient pas de manière à affecter matériellement les conclusions. |

### Règles de détection LLM

Signaler un problème de Cohérence lorsque :

- Des sous-totaux ou totaux ne correspondent pas à la somme de leurs composantes.
- La même métrique porte des valeurs différentes selon les feuilles ou sections.
- Des unités ou devises sont mélangées sans conversion.
- Les périodes sont incohérentes (p. ex. chiffres mensuels reportés incorrectement sur une ligne annuelle).
- Les signes sont incohérents (coûts positifs à un endroit, négatifs à un autre).

---

## Sensibilité (SV)

### Définition

La Sensibilité évalue si les leviers clés sont flexibles et si le classeur teste la réaction des sorties aux variations des hypothèses matérielles.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| SV1 – Excellent | 90–100 | Les leviers clés sont ajustables et une analyse de sensibilité ou de scénarios démontre les plages de sortie. |
| SV2 – Acceptable | 70–89 | Les leviers sont ajustables ; l'analyse de sensibilité est présente mais ne couvre pas tous les leviers matériels. |
| SV3 – Faible | 50–69 | Flexibilité limitée ; la sensibilité est traitée superficiellement ou seulement pour des leviers mineurs. |
| SV4 – Insuffisant | <50 | Les leviers sont figés ; aucune analyse de sensibilité ou de scénarios n'est présente. |

### Règles de détection LLM

Signaler un problème de Sensibilité lorsque :

- Les conclusions reposent sur une estimation ponctuelle unique sans plage testée.
- Les leviers clés ne peuvent être modifiés sans réécrire les formules.
- Aucun scénario, table de données ou sortie de sensibilité n'existe pour les leviers matériels.
- Une hypothèse volatile est présentée comme si elle était certaine.

---

## Insight (IN)

### Définition

L'Insight évalue si les sorties du classeur se traduisent en une recommandation claire et actionnable avec des prochaines étapes, responsables et échéances définis.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| IN1 – Excellent | 90–100 | Les sorties mènent à une recommandation claire avec étapes, responsables et échéances spécifiques. |
| IN2 – Acceptable | 70–89 | Une recommandation est présente ; les prochaines étapes sont partiellement définies. |
| IN3 – Faible | 50–69 | Les sorties sont présentes mais le chemin vers une recommandation ou une action est flou. |
| IN4 – Insuffisant | <50 | Aucune recommandation ni prochaine étape actionnable n'est tirée de l'analyse. |

### Règles de détection LLM

Signaler un problème d'Insight lorsque :

- Le classeur produit des sorties mais aucune recommandation ou constatation principale.
- Les prochaines étapes sont absentes ou non liées à l'analyse.
- Aucun responsable ni échéance n'est identifié pour les actions recommandées.
- La recommandation ne reflète pas le contexte ou les contraintes du client.

---

## Structure (ST)

### Définition

La Structure évalue si le classeur est organisé logiquement, suit les conventions de mise en forme et peut être revu par un tiers sans la présence de l'auteur.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| ST1 – Excellent | 90–100 | Entrées, calculs et sorties sont clairement séparés ; les onglets sont nommés et séquencés logiquement ; la mise en forme est cohérente. |
| ST2 – Acceptable | 70–89 | La structure est globalement claire avec un léger mélange des couches ou des incohérences de mise en forme. |
| ST3 – Faible | 50–69 | Les couches sont mélangées ; l'organisation des onglets ou la mise en forme est incohérente. |
| ST4 – Insuffisant | <50 | Aucune structure discernable ; entrées, calculs et sorties sont entremêlés arbitrairement. |

### Règles de détection LLM

Signaler un problème de Structure lorsque :

- Entrées, calculs et sorties partagent la même zone sans distinction.
- Les noms d'onglets sont génériques, dupliqués ou peu descriptifs (p. ex. Feuille1, Feuille2).
- Les formats de nombres, polices ou couleurs sont incohérents entre onglets.

---

## Cadre de classification de gravité

La gravité d'un problème est évaluée indépendamment des scores de catégorie. Un classeur peut obtenir un score global élevé tout en contenant des problèmes critiques exigeant une correction immédiate.

| Critère | Gravité 1 – Critique | Gravité 2 – Majeur | Gravité 3 – Mineur |
|-----------|------------------------|--------------------|--------------------|
| Définition | Change ou invalide la recommandation ou la décision d'affaires. | N'invalide pas la recommandation mais affaiblit significativement la confiance qu'on lui accorde. | Affecte la clarté ou le professionnalisme sans affecter la recommandation. |
| Impact commercial | Le client pourrait prendre une décision erronée si non résolu. | La recommandation nécessite une révision avant la revue de l'associé. | Aucun impact matériel sur la décision. |
| Priorité | Corriger immédiatement | Corriger avant la revue de l'associé | Améliorer quand c'est commode |
| Exemples | Erreur de formule dans une cellule de sortie principale. Conclusion contredisant les sorties du modèle. Hypothèse clé intégrée sans libellé. Entrée matérielle non sourcée. | Analyse de sensibilité absente pour un levier volatil. Référence de marché non sourcée. Désaccord de référence inter-feuilles. | Incohérences de mise en forme mineures. Noms d'onglets génériques sur feuilles non critiques. Arrondis sur calculs intermédiaires. |

En cas de doute entre deux gravités, attribuer la **plus élevée**.

---

## Évaluation de préparation associé

Le score global est calculé à partir des scores de catégorie pondérés.

| Score global | Évaluation |
|---------------|------------|
| 90–100 | Prêt pour associé |
| 75–89 | Révision mineure requise |
| 60–74 | Révision requise |
| Moins de 60 | Non prêt |

### Règles de dépassement

- Tout problème Critique retire automatiquement le statut Prêt pour associé.
- Trois problèmes Majeurs ou plus empêchent une note supérieure à Révision requise.
- Cinq problèmes Majeurs ou plus entraînent un classement Non prêt.

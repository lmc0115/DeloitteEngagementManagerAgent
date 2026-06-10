# Grille QA des présentations conseil (livrables diaporamas)

## Catégories d'évaluation

Le réviseur QA évalue les présentations conseil sur six dimensions. Chaque catégorie reçoit un score de 0 à 100 et contribue à l'évaluation globale de préparation associé.

| Catégorie | Code | Poids |
|----------|------|-------|
| Clarté du message des diapositives | SM | 20 % |
| Récit et enchaînement | NF | 20 % |
| Exactitude des données et visuels | DV | 20 % |
| Preuves et justification | ES | 25 % |
| Adéquation client et actionnabilité | CA | 10 % |
| Qualité des diapositives | SC | 5 % |
| **Total** | — | **100 %** |

---

## Clarté du message des diapositives (SM)

### Définition

Évalue si chaque diapositive communique une conclusion unique et explicite. Notée selon la spécificité du message (le titre énonce une conclusion plutôt qu'un sujet) et la focalisation sur un point unique (une constatation principale par diapositive), à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| SM1 – Excellent | 90–100 | Tous les titres énoncent des conclusions explicites. Le corps renforce directement le titre. |
| SM2 – Acceptable | 70–89 | La plupart des titres énoncent des conclusions. Quelques diapositives présentent des sujets plutôt que des conclusions. |
| SM3 – Faible | 50–69 | Plusieurs diapositives manquent de message clair. L'audience doit déduire le propos du corps de texte. |
| SM4 – Insuffisant | <50 | La plupart des diapositives présentent des sujets ou des données brutes sans conclusion énoncée. |

### Règles de détection LLM

Signaler un problème de Clarté du message lorsque :

- Le titre de diapositive décrit un sujet plutôt qu'une conclusion (p. ex. « Aperçu du marché » vs « Le marché se contracte »).
- Plusieurs points distincts se disputent l'attention sur une seule diapositive.
- L'insight clé n'apparaît que dans le corps de texte et est absent du titre.

---

## Récit et enchaînement (NF)

### Définition

Évalue si la séquence de diapositives construit un argument cohérent du début à la fin. Notée selon le séquencement logique des diapositives et la clarté des transitions, à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| NF1 – Excellent | 90–100 | Structure argumentative claire partout. Chaque diapositive prépare la suivante. Le récit est autonome. |
| NF2 – Acceptable | 70–89 | Le récit global est évident. Quelques transitions sont abruptes ou des diapositives semblent légèrement hors séquence. |
| NF3 – Faible | 50–69 | Aucun fil conducteur clair. Les diapositives sont organisées par sujet plutôt que par argument. |
| NF4 – Insuffisant | <50 | Aucune structure narrative discernable. Les diapositives apparaissent dans un ordre arbitraire ou contradictoire. |

### Règles de détection LLM

Signaler un problème de Récit et enchaînement lorsque :

- Le diaporama n'a pas d'énoncé de problème d'ouverture ni de recommandation de clôture identifiable.
- La dernière diapositive ne résout pas l'argument ouvert dans les premières diapositives.
- Du matériel d'annexe apparaît dans le flux principal sans transition ni explication.

---

## Exactitude des données et visuels (DV)

### Définition

Évalue si les graphiques, courbes et tableaux représentent fidèlement les données sous-jacentes. Notée selon l'exactitude numérique des valeurs et calculs et l'intégrité visuelle (axes étiquetés, échelles non trompeuses, données citées), à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| DV1 – Excellent | 90–100 | Tous les graphiques sont exacts. Axes étiquetés avec unités. Sources citées. Aucun choix visuel trompeur. |
| DV2 – Acceptable | 70–89 | Lacunes d'étiquetage mineures. Aucune représentation erronée matérielle des données. |
| DV3 – Faible | 50–69 | Plusieurs lacunes d'étiquetage ou incohérences. Des choix visuels obscurcissent ou déforment les données. |
| DV4 – Insuffisant | <50 | Les graphiques contiennent des erreurs de calcul, des sources manquantes ou induisent visuellement en erreur. |

### Règles de détection LLM

Signaler un problème d'Exactitude des données et visuels lorsque :

- Les axes de graphique manquent d'étiquettes ou d'unités.
- La conclusion énoncée d'une diapositive ne correspond pas aux données du graphique associé.
- La même métrique est présentée avec des valeurs différentes sur deux diapositives ou plus.

---

## Preuves et justification (ES)

### Définition

Évalue si les affirmations, constatations et recommandations sont étayées par des données, recherches, références ou analyses citées. Notée selon la présence de preuves pour les affirmations matérielles et la crédibilité et l'actualité des sources, à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| ES1 – Excellent | 90–100 | Toutes les affirmations matérielles sont étayées. Les sources sont crédibles et actuelles. |
| ES2 – Acceptable | 70–89 | La plupart des affirmations sont étayées. Des affirmations non étayées mineures sont présentes. |
| ES3 – Faible | 50–69 | Plusieurs affirmations non étayées. Les preuves sont minces, vagues ou non citées. |
| ES4 – Insuffisant | <50 | Les conclusions et recommandations sont présentées sans preuve à l'appui. |

### Règles de détection LLM

Signaler un problème de Preuves et justification lorsque :

- Une affirmation quantitative est énoncée sans source citée.
- Une formule comme « notre analyse montre » est utilisée sans référencer de données ou méthodologie spécifiques.
- Les preuves citées proviennent d'une source non crédible ou sont obsolètes par rapport à la portée de l'analyse.

---

## Adéquation client et actionnabilité (CA)

### Définition

Évalue si les recommandations sont adaptées au contexte, aux contraintes et aux objectifs déclarés du client, et si elles se traduisent en actions concrètes avec responsables et échéances définis. Notée selon l'adaptation au contexte client et l'actionnabilité des recommandations, à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| CA1 – Excellent | 90–100 | Les recommandations sont spécifiques au client. Les prochaines étapes ont des responsables et échéances définis. |
| CA2 – Acceptable | 70–89 | Les recommandations conviennent globalement au client. Quelques éléments génériques. Prochaines étapes partiellement définies. |
| CA3 – Faible | 50–69 | Recommandations largement génériques. Adaptation limitée. Détail de mise en œuvre absent ou superficiel. |
| CA4 – Insuffisant | <50 | Recommandations génériques ou irréalistes. Aucune prochaine étape actionnable identifiée. |

### Règles de détection LLM

Signaler un problème d'Adéquation client et actionnabilité lorsque :

- Les recommandations emploient un langage générique applicable à toute organisation de tout secteur.
- Les contraintes, priorités ou objectifs spécifiques au client énoncés dans le diaporama ne se reflètent pas dans les recommandations.
- Aucune prochaine étape, responsable ou échéance n'est identifié sur la diapositive de recommandations.

---

## Qualité des diapositives (SC)

### Définition

Évalue la densité de texte, la hiérarchie visuelle et la finition professionnelle. Notée selon l'économie de texte et la hiérarchie visuelle par diapositive et la cohérence et le professionnalisme de la mise en forme du diaporama, à parts égales.

### Niveaux de notation

| Niveau | Plage de score | Description |
|-------|-------------|-------------|
| SC1 – Excellent | 90–100 | Les diapositives sont nettes et visuellement organisées. Le texte est concis. Mise en forme cohérente partout. |
| SC2 – Acceptable | 70–89 | Globalement bien mises en forme. Problèmes mineurs de densité ou de cohérence sur quelques diapositives. |
| SC3 – Faible | 50–69 | Plusieurs diapositives sont surchargées de texte ou désorganisées. Mise en forme incohérente. |
| SC4 – Insuffisant | <50 | Les diapositives sont constamment denses ou visuellement difficiles à saisir d'un coup d'œil. |

### Règles de détection LLM

Signaler un problème de Qualité des diapositives lorsque :

- Une diapositive contient plus de 50 mots de texte en prose.
- Plusieurs tailles de police, couleurs ou styles de texte sont utilisés de façon incohérente entre diapositives.
- Des erreurs grammaticales ou d'orthographe sont présentes.

---

## Cadre de classification de gravité

La gravité d'un problème est évaluée indépendamment des scores de catégorie. Un livrable peut obtenir un score global élevé tout en contenant des problèmes critiques exigeant une correction immédiate.

| Critère | Gravité 1 – Critique | Gravité 2 – Majeur | Gravité 3 – Mineur |
|-----------|------------------------|--------------------|--------------------|
| Définition | Change ou invalide la recommandation ou la décision d'affaires. | N'invalide pas la recommandation mais affaiblit significativement la confiance qu'on lui accorde. | Affecte la clarté ou le professionnalisme sans affecter la recommandation. |
| Impact commercial | Le client pourrait prendre une décision erronée si non résolu. | La recommandation nécessite une révision avant la revue de l'associé. | Aucun impact matériel sur la décision. |
| Priorité | Corriger immédiatement | Corriger avant la revue de l'associé | Améliorer quand c'est commode |
| Exemples | Un graphique contredit son titre. Affirmation quantitative non citée. Recommandation en conflit avec un objectif client déclaré. | La séquence de diapositives manque de progression logique. Recommandations génériques. Prochaines étapes absentes. | Arrondis sur chiffres approximatifs. Erreurs grammaticales. Incohérences de mise en forme mineures. |

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

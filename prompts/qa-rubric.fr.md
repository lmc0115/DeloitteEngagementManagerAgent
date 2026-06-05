# Grille QA des livrables conseil

## Catégories de revue

Le réviseur assurance qualité IA évalue les livrables conseil selon huit dimensions fondamentales couramment utilisées dans les revues qualité. Chaque catégorie reçoit une note de 0 à 100 et contribue à l'évaluation globale de préparation associé.

| Catégorie | Poids |
|----------|--------|
| Logique | 20 % |
| Preuves | 15 % |
| Hypothèses | 10 % |
| Chiffres | 15 % |
| Adéquation client | 15 % |
| Risque | 10 % |
| Actionnabilité | 10 % |
| Communication | 5 % |
| Total | 100 % |

---

## Logique

### Définition

La logique évalue si les recommandations et conclusions sont étayées par l'analyse et si le livrable démontre un raisonnement cause-effet clair.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| L'analyse soutient la recommandation | 50 % |
| Raisonnement cause-effet | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| L1 – Excellent | 90–100 | Les recommandations sont directement étayées par les constats. Les relations cause-effet sont clairement expliquées. Aucune incohérence logique. Les conclusions découlent naturellement de l'analyse. |
| L2 – Acceptable | 70–89 | Les recommandations sont généralement étayées. Lacunes logiques mineures. Raisonnement cause-effet majoritairement clair. |
| L3 – Faible | 50–69 | Lacunes logiques significatives. Recommandations partiellement étayées. Relations cause-effet peu claires. |
| L4 – Insuffisant | <50 | Les recommandations contredisent les constats. Incohérences logiques majeures. Conclusions non étayées. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Recommandations entièrement étayées par l'analyse sans lacune logique. |
| 70–89 | Lacunes logiques mineures, conclusions toujours étayées. |
| 50–69 | Plusieurs lacunes logiques affaiblissent les recommandations. |
| Moins de 50 | Conclusions non étayées ou contredisant l'analyse. |

### Règles de détection LLM

Signaler un problème Logique lorsque :

- Les recommandations ne sont pas étayées par l'analyse.
- Les relations cause-effet sont affirmées mais non démontrées.
- Les conclusions introduisent des informations non abordées auparavant.
- Les recommandations contredisent des preuves ailleurs dans le livrable.

---

## Preuves

### Définition

Les preuves évaluent si les affirmations, constats et recommandations sont étayés par des données crédibles, recherches, benchmarks ou exemples.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Preuves à l'appui présentes | 50 % |
| Qualité et crédibilité des sources | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| E1 – Excellent | 90–100 | Toutes les affirmations majeures étayées. Sources crédibles et actuelles. Les preuves renforcent clairement les recommandations. |
| E2 – Acceptable | 70–89 | La plupart des affirmations étayées. Assertions mineures non étayées. |
| E3 – Faible | 50–69 | Plusieurs affirmations non étayées. Preuves limitées ou faibles. |
| E4 – Insuffisant | <50 | Conclusions présentées sans preuves à l'appui. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Au moins 90 % des affirmations majeures étayées par des preuves. |
| 70–89 | Entre 70 % et 89 % des affirmations majeures étayées. |
| 50–69 | Entre 50 % et 69 % des affirmations majeures étayées. |
| Moins de 50 | Moins de 50 % des affirmations majeures étayées. |

### Règles de détection LLM

Signaler un problème Preuves lorsque :

- Des affirmations contiennent des statistiques sans source.
- Les recommandations manquent de preuves à l'appui.
- Des benchmarks sectoriels sont mentionnés mais non cités.
- Des énoncés vagues sont présentés sans support.
- Les preuves sont obsolètes ou non pertinentes pour la recommandation.

---

## Hypothèses

### Définition

Les hypothèses évaluent si les hypothèses importantes sont explicitement identifiées et raisonnables dans le contexte de l'analyse.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Hypothèses identifiées | 50 % |
| Hypothèses validées | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| A1 – Excellent | 90–100 | Hypothèses clairement énoncées. Justifiées et testées. |
| A2 – Acceptable | 70–89 | Hypothèses présentes mais partiellement validées. |
| A3 – Faible | 50–69 | Plusieurs hypothèses restent implicites. |
| A4 – Insuffisant | <50 | Hypothèses critiques manquantes. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Toutes les hypothèses matérielles identifiées et justifiées. |
| 70–89 | La plupart des hypothèses identifiées avec omissions mineures. |
| 50–69 | Plusieurs hypothèses importantes non énoncées. |
| Moins de 50 | Hypothèses critiques omises. |

### Règles de détection LLM

Signaler un problème Hypothèses lorsque :

- Les recommandations dépendent d'hypothèses non énoncées.
- Les prévisions reposent sur des hypothèses non divulguées.
- Les hypothèses contredisent les preuves disponibles.
- Les hypothèses sont irréalistes compte tenu du contexte client.

---

## Chiffres

### Définition

Les chiffres évaluent l'exactitude numérique et la cohérence dans l'ensemble du livrable.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Exactitude des calculs | 50 % |
| Cohérence dans le document | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| N1 – Excellent | 90–100 | Calculs exacts. Chiffres cohérents dans tout le document. |
| N2 – Acceptable | 70–89 | Écarts d'arrondi mineurs. Aucun impact sur les recommandations. |
| N3 – Faible | 50–69 | Plusieurs incohérences nécessitant vérification. |
| N4 – Insuffisant | <50 | Erreurs numériques affectant les constats ou recommandations. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Aucune incohérence numérique détectée. |
| 70–89 | Écarts d'arrondi ou de formatage mineurs uniquement. |
| 50–69 | Plusieurs incohérences nécessitant validation. |
| Moins de 50 | Erreurs numériques affectant matériellement les conclusions. |

### Règles de détection LLM

Signaler un problème Chiffres lorsque :

- Les calculs de pourcentage sont incorrects.
- Les totaux ne concordent pas.
- Les chiffres et le texte narratif divergent.
- La même métrique est rapportée différemment à plusieurs endroits.

---

## Adéquation client

### Définition

L'adéquation client évalue si les recommandations s'alignent avec le secteur, les objectifs stratégiques, l'environnement opérationnel et les contraintes de mise en œuvre du client.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Alignement avec le contexte client | 50 % |
| Faisabilité de mise en œuvre | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| CF1 – Excellent | 90–100 | Recommandations hautement adaptées. Réalistes et faisables. |
| CF2 – Acceptable | 70–89 | Recommandations généralement adaptées au client. Certaines restent génériques. |
| CF3 – Faible | 50–69 | Personnalisation limitée au contexte client. |
| CF4 – Insuffisant | <50 | Recommandations irréalistes ou non pertinentes. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Recommandations clairement adaptées aux circonstances du client. |
| 70–89 | Recommandations généralement adaptées mais avec éléments génériques. |
| 50–69 | Peu de preuves de personnalisation. |
| Moins de 50 | Recommandations irréalistes ou inadaptées à l'environnement client. |

### Règles de détection LLM

Signaler un problème Adéquation client lorsque :

- Les recommandations semblent génériques.
- Les contraintes client ne sont pas abordées.
- Les considérations sectorielles sont ignorées.
- Les recommandations contredisent les objectifs client énoncés.

---

## Risque

### Définition

Le risque évalue si les risques majeurs, dépendances et stratégies d'atténuation sont identifiés et traités.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Identification des risques | 50 % |
| Planification de l'atténuation | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| R1 – Excellent | 90–100 | Risques majeurs identifiés. Stratégies d'atténuation fournies. |
| R2 – Acceptable | 70–89 | Risques identifiés. Planification d'atténuation incomplète. |
| R3 – Faible | 50–69 | Risques abordés superficiellement. |
| R4 – Insuffisant | <50 | Risques non traités. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Risques majeurs identifiés et plans d'atténuation fournis. |
| 70–89 | La plupart des risques identifiés avec planification partielle. |
| 50–69 | Discussion des risques incomplète. |
| Moins de 50 | Risques largement absents. |

### Règles de détection LLM

Signaler un problème Risque lorsque :

- Des risques de mise en œuvre significatifs sont omis.
- Les dépendances ne sont pas identifiées.
- Les plans d'atténuation sont absents.
- Les risques réglementaires, opérationnels, financiers ou réputationnels sont ignorés.

---

## Actionnabilité

### Définition

L'actionnabilité évalue si les recommandations peuvent être mises en œuvre et traduites en actions concrètes.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Actions claires définies | 50 % |
| Responsable et échéancier identifiés | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| AC1 – Excellent | 90–100 | Actions spécifiques identifiées. Responsables et échéances fournis. |
| AC2 – Acceptable | 70–89 | Actions claires. Responsable ou calendrier partiellement définis. |
| AC3 – Faible | 50–69 | Recommandations manquant de détails de mise en œuvre. |
| AC4 – Insuffisant | <50 | Recommandations non actionnables. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Recommandations incluant actions, responsables et échéances. |
| 70–89 | Actions identifiées mais responsable ou échéances incomplets. |
| 50–69 | Recommandations manquant de détails de mise en œuvre. |
| Moins de 50 | Recommandations non actionnables. |

### Règles de détection LLM

Signaler un problème Actionnabilité lorsque :

- Les recommandations manquent de prochaines étapes.
- Aucun responsable n'est identifié.
- Aucun échéancier n'est fourni.
- Les exigences de mise en œuvre sont floues.

---

## Communication

### Définition

La communication évalue la clarté, la structure, le professionnalisme et la lisibilité pour la direction.

### Critères d'évaluation

| Métrique | Poids |
|--------|--------|
| Structure et flux | 50 % |
| Clarté et professionnalisme | 50 % |

### Niveaux de notation

| Niveau | Plage | Description |
|-------|-------------|-------------|
| C1 – Excellent | 90–100 | Communication claire et concise. Style conseil professionnel. Prêt pour la direction. |
| C2 – Acceptable | 70–89 | Message compréhensible. Améliorations mineures de clarté nécessaires. |
| C3 – Faible | 50–69 | Difficile à suivre. Complexité excessive ou mauvaise organisation. |
| C4 – Insuffisant | <50 | Problèmes de communication significatifs. Restructuration majeure requise. |

### Guide de notation objectif

| Plage | Standard |
|-------------|----------|
| 90–100 | Communication claire, concise et prête pour la direction. |
| 70–89 | Généralement clair avec problèmes mineurs. |
| 50–69 | Difficile à suivre dans plusieurs sections. |
| Moins de 50 | Obstacles de communication significatifs. |

### Règles de détection LLM

Signaler un problème Communication lorsque :

- Les messages clés sont difficiles à identifier.
- La structure est confuse ou incohérente.
- Un jargon excessif réduit la clarté.
- Des conclusions importantes sont noyées dans le texte de support.

---

## Cadre de classification de la gravité

La gravité des problèmes est évaluée indépendamment des notes par catégorie. Un livrable peut obtenir un score global élevé tout en contenant des problèmes critiques nécessitant une correction immédiate.

| Critère | Gravité 1 – Critique | Gravité 2 – Majeur | Gravité 3 – Mineur |
|-----------|------------------------|--------------------|--------------------|
| Définition | Problème qui change, invalide ou affaiblit matériellement la recommandation, conclusion ou décision commerciale. | Problème qui n'invalide pas la recommandation mais affaiblit significativement la confiance. | Problème affectant la lisibilité, le professionnalisme, le formatage ou la clarté sans affecter la recommandation. |
| Impact commercial | Le client pourrait prendre une décision incorrecte si le problème persiste. | La recommandation reste directionnellement correcte mais nécessite révision avant revue associé. | Aucun impact matériel sur la prise de décision. |
| Priorité | Corriger immédiatement | Corriger avant revue associé | Améliorer quand possible |
| Exemples | Calculs incorrects affectant les recommandations. Valeur numérique ou statistique sans source. Valeur dont la source citée ne la contient pas ou provient d'une source non crédible. Constats et recommandations contradictoires. Hypothèses manquantes invalidant les conclusions. Recommandations stratégiques non étayées. | Preuves à l'appui manquantes. Évaluation des risques faible. Faible personnalisation client. Considérations de mise en œuvre manquantes. | Incohérences de formatage. Problèmes de format de citation. Langage redondant. Problèmes de formulation mineurs. Erreurs grammaticales. Écarts d'arrondi sur chiffres explicitement qualifiés d'approximatifs (p. ex. « environ », « approximativement »). |

En cas de doute entre deux gravités, attribuer la **plus élevée**.

---

## Évaluation de préparation associé

Le score global est calculé à partir des notes pondérées par catégorie.

| Score global | Évaluation |
|---------------|------------|
| 90–100 | Prêt pour associé |
| 75–89 | Révision mineure requise |
| 60–74 | Révision requise |
| Moins de 60 | Non prêt |

### Règles de dépassement

- Tout problème Critique retire automatiquement le statut Prêt pour associé.
- Trois problèmes Majeurs ou plus empêchent une note supérieure à Révision requise.
- Cinq problèmes Majeurs ou plus entraînent une classification Non prêt.

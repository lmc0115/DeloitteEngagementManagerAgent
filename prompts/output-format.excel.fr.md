# Format de sortie du réviseur IA — Livrables classeur (XLSX)

Structure de chaque revue QA produite par l'agent pour les livrables tableurs / modèles. Répondez en **Markdown bien structuré** en suivant exactement cette spécification. **Rédigez l'intégralité du rapport en français.**

## Sections (dans l'ordre)

**En-tête** → Évaluation globale → Tableau des catégories → Top 3 priorités → Points forts → Problèmes identifiés → Tableau récapitulatif → Notes de dépassement → Métadonnées du réviseur

- **Points forts** est omis lorsque le score global est inférieur à 60.
- **Notes de dépassement** n'apparaît que lorsqu'une règle de dépassement s'applique.

---

## En-tête

Inclure en haut de chaque rapport :

**Exemple de sortie :**

> **Fichiers revus :** modele.xlsx
> **Modèle :** Agent QA Conseil | **Revu le :** 2026/05/31 14:30:00
> **Version de la grille :** Classeur 1.0

- **Fichiers revus :** lister chaque nom de fichier de la section Livrables du prompt.
- **Modèle :** utiliser `Agent QA Conseil` sauf si un identifiant de modèle spécifique est fourni.
- **Revu le :** utiliser l'horodatage au format `AAAA/MM/JJ HH:MM:SS`.

---

## Évaluation globale

Trois lignes : score, verdict et justification en une phrase nommant la constatation la plus importante.

**Exemple de sortie :**

> ### Évaluation globale
>
> **Score global :** 75 / 100
> **Verdict :** Révision requise
> **Justification :** Structure solide, mais une erreur de formule Critique dans la cellule de sortie du chiffre d'affaires déclenche le dépassement qui empêche le statut Prêt pour associé.

Le verdict doit être l'un de : **Prêt pour associé**, **Révision mineure requise**, **Révision requise**, **Non prêt** — selon l'évaluation de préparation associé et les règles de dépassement de la grille.

---

## Tableau des catégories

Une ligne par catégorie, dans cet **ordre fixe**. Toujours les huit, même sans problème.

| Catégorie | Score | Niveau | Poids | Justification |
|----------|-------|-------|--------|-----------|
| Formules | 95 | FM1 – Excellent | 20 % | Aucune valeur d'erreur ; les calculs référencent les entrées. |
| Analyse | 72 | AN2 – Acceptable | 20 % | Conclusions étayées avec une lacune de raisonnement mineure. |
| Sources | 70 | SR2 – Acceptable | 15 % | Une référence manque de citation. |
| Hypothèses | 90 | AS1 – Excellent | 10 % | Leviers isolés et justifiés. |
| Cohérence | 35 | CN4 – Insuffisant | 10 % | Les totaux inter-feuilles ne se réconcilient pas. |
| Sensibilité | 75 | SV2 – Acceptable | 10 % | Sensibilité présente mais omet un levier volatil. |
| Insight | 75 | IN2 – Acceptable | 10 % | Recommandation énoncée ; étapes partielles. |
| Structure | 80 | ST2 – Acceptable | 5 % | Léger mélange des entrées et calculs. |

Les codes de niveau utilisent le préfixe spécifique à la catégorie de la grille (**FM** Formules, **AN** Analyse, **SR** Sources, **AS** Hypothèses, **CN** Cohérence, **SV** Sensibilité, **IN** Insight, **ST** Structure), le chiffre indiquant la bande de qualité (1 Excellent, 2 Acceptable, 3 Faible, 4 Insuffisant).

Score et niveau doivent concorder : 90–100 → FM1/AN1 etc. ; 70–89 → x2 ; 50–69 → x3 ; moins de 50 → x4.

---

## Top 3 priorités

Les trois problèmes à corriger en premier, classés par **gravité** puis **poids de catégorie**. Chaque priorité indique **quoi faire**, pas ce qui ne va pas.

**Exemple de sortie :**

> ### Top 3 priorités
>
> 1. Réparer l'erreur #REF! dans la cellule D12 de l'onglet Sorties pour que le total se calcule.
> 2. Réconcilier le total du Résumé avec les lignes de composantes de l'onglet Calculs.
> 3. Ajouter une source citée pour la référence de croissance de marché de l'onglet Hypothèses.

---

## Points forts

Deux ou trois éléments bien réussis. **Omettre entièrement cette section** si le score global est inférieur à 60.

**Exemple de sortie :**

> ### Points forts
>
> - Séparation claire des entrées, calculs et sorties entre onglets.
> - Hypothèses de leviers isolées dans un bloc d'entrée dédié.
> - Table de sensibilité couvrant le levier de croissance principal.

---

## Problèmes identifiés

Enregistrements numérotés, un par problème. Chaque problème comporte exactement ces **six champs**, dans cet ordre :

| Champ | Contenu |
|-------|---------|
| **Catégorie** | Une des huit catégories de la grille. |
| **Gravité** | Gravité 1 – Critique, Gravité 2 – Majeur ou Gravité 3 – Mineur. |
| **Emplacement** | Nom d'onglet et référence de cellule ou plage (p. ex. « Sorties!D12 »). Citer un extrait court si utile. |
| **Constat** | Une à trois phrases expliquant ce qui ne va pas. |
| **Impact commercial** | Une phrase sur la conséquence pour le client si non corrigé. |
| **Correction suggérée** | Une révision concrète que l'humain peut appliquer ou rejeter. |

**Exemple de sortie :**

> ### Problèmes identifiés
>
> #### Problème 1
>
> - **Catégorie :** Formules
> - **Gravité :** Gravité 1 – Critique
> - **Emplacement :** Sorties!D12 : « =CA!#REF! »
> - **Constat :** Le total du chiffre d'affaires donne #REF!, donc chaque chiffre en aval qui en dépend est vide ou erroné.
> - **Impact commercial :** Le client pourrait s'appuyer sur un chiffre d'affaires incomplet et mal évaluer le dossier d'investissement.
> - **Correction suggérée :** Rediriger la formule vers la cellule source déplacée CA!B20.

Si aucun problème : écrire **Aucun problème identifié.**

---

## Tableau récapitulatif

Une ligne par problème pour un triage rapide. Utiliser **Critique**, **Majeur** ou **Mineur** dans la colonne Gravité (pas « Gravité 1 – Critique »). Les cellules de gravité sont codées par couleur dans l'interface.

| # | Catégorie | Gravité | Emplacement | Correction en une ligne |
|---|----------|----------|----------|--------------|
| 1 | Formules | Critique | Sorties!D12 | Rediriger la référence rompue vers CA!B20. |
| 2 | Cohérence | Majeur | Résumé!C8 | Réconcilier le total avec ses lignes de composantes. |
| 3 | Sources | Majeur | Hypothèses!B5 | Ajouter une citation pour la référence de croissance. |

Si aucun problème : inclure une seule ligne avec « - » dans toutes les colonnes sauf # (utiliser « - »).

---

## Notes de dépassement

Inclure **uniquement** lorsqu'une règle de dépassement s'applique. Nommer la règle et expliquer comment elle a modifié le verdict.

**Exemple de sortie (dépassement appliqué) :**

> ### Notes de dépassement
>
> - La moyenne pondérée de 78 correspond à Révision mineure requise. L'erreur de formule Critique dans Sorties!D12 déclenche le dépassement et rétrograde le verdict à Révision requise.

Lorsqu'aucun dépassement ne s'applique, vous pouvez omettre entièrement cette section.

---

## Métadonnées du réviseur

Dernière ligne du rapport :

**Exemple de sortie :**

> ### Métadonnées du réviseur
>
> **Réviseur :** Agent QA Conseil | **Grille :** Classeur v1.0 | **Exécution :** 2026-05-31T14:30:00Z

---

## Règles de l'agent

- Toujours inclure les huit catégories dans le tableau, même sans problème.
- Score et niveau doivent concorder : 90–100 → x1 ; 70–89 → x2 ; 50–69 → x3 ; moins de 50 → x4.
- Le score global est la moyenne pondérée selon les poids de la grille (Formules 20, Analyse 20, Sources 15, Hypothèses 10, Cohérence 10, Sensibilité 10, Insight 10, Structure 5), arrondie à l'entier le plus proche.
- En cas de doute entre deux gravités, attribuer la **plus élevée**.
- Ne **pas** réécrire le livrable, inventer des sources ou des chiffres, ni spéculer sur l'intention de l'auteur.
- Référencer un contenu précis — noms d'onglets, adresses de cellules ou noms de métriques — dans chaque problème. Les observations génériques ne sont pas acceptables.
- Une valeur d'erreur de formule (#REF!, #DIV/0!, #N/A, #VALUE!, #NAME?) dans une cellule de sortie principale, ou une conclusion contredisant les sorties du modèle, est **Gravité 1 – Critique**.
- Une entrée ou référence matérielle **sans source citée** est **Gravité 1 – Critique**.
- Les écarts d'arrondi sur des chiffres explicitement qualifiés d'approximatifs et les incohérences de mise en forme mineures sont **Gravité 3 – Mineur**, jamais Critique.

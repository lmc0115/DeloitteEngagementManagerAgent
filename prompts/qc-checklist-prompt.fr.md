# Liste de contrôle QC humaine (format machine — serveur uniquement)

Après **Métadonnées du réviseur**, produire ce délimiteur sur sa propre ligne, puis un **tableau JSON** (sans blocs de code) avec un objet par problème de **Problèmes identifiés**.

```
---QC_CHECKLIST_JSON---
```

## Schéma JSON (un objet par problème)

| Champ | Type | Description |
|-------|------|-------------|
| `issueNumber` | number | 1, 2, 3… |
| `category` | string | Catégorie de la grille |
| `severity` | string | p. ex. `Gravité 1 – Critique` |
| `severityLevel` | string | `"1"`, `"2"` ou `"3"` |
| `location` | string | Emplacement dans le livrable |
| `problem` | string | Ce qui ne va pas |
| `businessImpact` | string | Conséquence client si non corrigé |
| `suggestedFix` | string | Correction concrète du rapport |

Si aucun problème : produire un tableau vide : `[]`

**Exemple :**

---QC_CHECKLIST_JSON---
[{"issueNumber":1,"category":"Chiffres","severity":"Gravité 3 – Mineur","severityLevel":"3","location":"Paragraphe 1","problem":"Chiffre qualifié d'approximatif ; 77,4 % vs 75 % est un écart d'arrondi mineur.","businessImpact":"Aucun impact matériel sur la décision.","suggestedFix":"Recalculer à 74,7 % ou ajuster la cible à 852."}]

## Règles

- Toujours inclure le délimiteur et le JSON, même si le tableau est vide.
- Le bloc JSON est retiré du rapport affiché — il alimente l'interface de liste de contrôle QC humaine.
- Chaque problème de **Problèmes identifiés** doit apparaître dans le tableau JSON avec les champs correspondants.
- Compléter le rapport Markdown complet (En-tête jusqu'à Métadonnées du réviseur) **avant** le bloc JSON.
- Appliquer les règles de gravité v2 : chiffres approximatifs/hedged → Mineur ; statistiques sans source → Critique ; erreurs grammaticales → Mineur.
- Si la limite de longueur approche, raccourcir les justifications du tableau des catégories mais **ne jamais** omettre Problèmes identifiés, Tableau récapitulatif ou `---QC_CHECKLIST_JSON---`.

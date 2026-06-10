export default {
  brandLabel: "Conseil · Assurance qualité",
  title: "Réviseur QA des livrables",
  lead:
    "Contrôle qualité par LLM pour mini-présentations et mémos prêts pour associé — évalue huit catégories, signale les problèmes par gravité et suggère des corrections. Vous décidez quoi modifier avant la revue.",
  workflow: [
    "Créer le livrable",
    "Revue QA LLM",
    "Tableau des catégories",
    "Signaler les problèmes",
    "Attribuer la gravité",
    "Décision humaine",
  ],

  upload: {
    title: "Téléverser les livrables",
    step: "Étape 1",
    sub: "Mini-présentations ou mémos — .txt, .md, .pdf, .docx, .xlsx ou .pptx (max 15 Mo chacun, jusqu'à 10 fichiers)",
    dragDrop: "Glisser-déposer des fichiers",
    or: "ou",
    browse: "Parcourir",
    remove: "Retirer",
  },

  rubric: {
    title: "Grille QA",
    badge: "Pondérée · v1.0",
    expand: "Agrandir la grille (plein écran)",
    sub: "Catégories notées de 0 à 100 avec seuils de préparation associé, adaptées au type de fichier téléversé. Le format de sortie IA est affiché à la fin — faites défiler.",
    loading: "Chargement de la grille…",
    additionalRequirements: "Exigences supplémentaires",
    optional: "facultatif",
    hint: "Ajoutées à la grille par défaut pour cette revue uniquement (contexte client, règles sectorielles, spécificités de la mission).",
    placeholder:
      "p. ex., Vérifier que tous les chiffres utilisent la base FY2024. Signaler toute mention du concurrent X sans source.",
    modalTitle: "Grille QA et format de sortie",
    modalSub: "Critères complets et spécification de sortie du réviseur IA (v1.0)",
    close: "Fermer",
    additionalSection: "Exigences supplémentaires",
    typeLabel: "Jeu de grille",
    typeHint:
      "Sélectionné automatiquement selon vos fichiers téléversés. Modifiez-le pour évaluer avec une autre grille.",
    typeAuto: "sélectionné automatiquement selon les fichiers",
    types: {
      document: "Document (PDF / Word / texte)",
      excel: "Classeur (Excel / XLSX / CSV)",
      pptx: "Présentation (PPTX)",
    },
  },

  cta: {
    filesReady: (n) => `${n} fichier(s) prêt(s) pour la revue`,
    uploadFirst: "Téléversez au moins un livrable pour lancer la revue QA",
    runReview: "Lancer la revue QA",
    reviewing: "Revue en cours…",
  },

  report: {
    title: "Rapport de revue QA",
    badge: "Rapport noté · v1.0",
    expand: "Agrandir le rapport (plein écran)",
    model: "Modèle",
    reviewed: "Revu le",
    files: "Fichiers",
    rubric: "Grille",
    overallScore: "Score global",
    verdict: "Verdict",
    truncationBanner:
      "Le rapport peut être incomplet — le modèle a atteint la limite de sortie. Utilisez Agrandir le rapport (plein écran) pour faire défiler, ou augmentez GEMINI_MAX_OUTPUT_TOKENS dans .env et relancez.",
    analyzing: "Analyse des livrables",
    analyzingSub:
      "Notation des huit catégories, application des règles de dépassement et mise en forme du rapport. Cela peut prendre jusqu'à une minute sur le niveau gratuit.",
    close: "Fermer",
  },

  checklist: {
    title: "Liste de contrôle QC humaine",
    badge: "Problèmes du rapport",
    sub: "Remplie par l'agent IA sous forme d'éléments structurés (un par problème). Indiquez si vous modifierez comme suggéré, différemment ou tel quel.",
    emptyBefore:
      "Lancez d'abord la revue QA — les éléments apparaîtront ici automatiquement.",
    emptyAfter:
      "Aucun problème identifié dans le rapport, ou la liste n'a pas pu être extraite. Relancez la revue si vous vous attendiez à des signalements.",
    businessImpact: "Impact commercial :",
    suggestedFix: "Correction suggérée :",
    humanDecision: "Décision humaine",
    placeholder:
      "p. ex., Modifier comme suggéré · Modifier autrement parce que… · Accepter tel quel · Reporter à l'associé",
    severity: { 1: "Critique", 2: "Majeur", 3: "Mineur" },
  },

  pdf: {
    title: "Exporter le dossier",
    badge: "Téléchargement PDF",
    sub: "Constituez un PDF prêt client avec grille, rapport IA et/ou liste de contrôle. Les noms de fichiers figurent sur la page de couverture.",
    includeRubric: "Grille QA (par défaut + exigences supplémentaires)",
    includeReport: "Rapport de revue IA",
    includeChecklist: "Liste de contrôle QC humaine (problèmes + vos décisions)",
    download: "Télécharger le PDF",
    alertNoSection: "Sélectionnez au moins une section à inclure dans le PDF.",
    alertNoReport: "Lancez une revue avant d'inclure le rapport IA dans le PDF.",
    coverBrand: "CONSEIL · ASSURANCE QUALITÉ",
    coverTitle: "Dossier QA des livrables",
    coverSub: "Revue associé · Grille · Rapport · Liste de contrôle",
    generated: "Généré le :",
    filesReviewed: "Fichiers revus :",
    model: "Modèle",
    reviewed: "Revu le",
    files: "Fichiers",
    rubric: "Grille",
    overallScore: "Score global",
    verdictLabel: "Verdict",
    sectionRubric: "Grille QA",
    sectionRubricSub:
      "Catégories, niveaux de gravité et règles de revue appliquées à cette mission",
    sectionReport: "Rapport de revue QA IA",
    sectionReportSub: "Problèmes signalés avec gravité et corrections suggérées",
    sectionChecklist: "Liste de contrôle QC humaine",
    sectionChecklistSub: "Problèmes du rapport IA — décisions humaines",
    humanDecision: "Décision humaine :",
    suggestedFix: "Correction suggérée :",
    notProvided: "(non renseigné)",
    footer: (page, total) =>
      `Dossier QA des livrables · Page ${page} sur ${total}`,
    filenameParts: { rubric: "grille", report: "rapport", checklist: "controle", export: "export" },
  },

  errors: {
    uploadRequired: "Veuillez téléverser au moins un fichier livrable.",
    reviewFailed: "Échec de la revue",
  },

  lang: {
    label: "Langue",
    en: "English",
    fr: "Français",
  },
};

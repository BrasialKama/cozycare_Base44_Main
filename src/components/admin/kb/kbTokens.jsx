// Centralized visual tokens & label maps for the Knowledge Base.

export const SEVERITY_LABELS = {
  highest: 'Najviše',
  high: 'Visoko',
  medium: 'Srednje',
  low: 'Nisko',
  procedural: 'Proceduralno',
  none: null,
};

export const SEVERITY_BADGE_CLASSES = {
  highest: 'bg-red-50 text-red-900 border-red-200',
  high: 'bg-amber-50 text-amber-900 border-amber-200',
  medium: 'bg-blue-50 text-blue-900 border-blue-200',
  low: 'bg-slate-50 text-slate-700 border-slate-200',
  procedural: 'bg-slate-50 text-slate-700 border-slate-200',
  none: '',
};

export const LEGAL_SIGNOFF_LABELS = {
  required_extensive: 'Pravni pregled — opsežno potreban',
  required: 'Pravni pregled — potreban',
  recommended: 'Pravni pregled — preporučen',
  not_required: 'Pravni pregled — nije potreban',
};

export const DOC_TYPE_LABELS = {
  principles: 'Principi',
  scenario: 'Scenarij',
  glossary: 'Pojmovnik',
  decision_index: 'Brzi pristup',
};
/**
 * All administrative districts of Rwanda.
 * Used in profile forms, job post forms, and search filters.
 * Source: Rwanda Ministry of Local Government (MINALOC)
 */
export const RWANDA_DISTRICTS = [
  // Kigali City
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  // Eastern Province
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
  // Northern Province
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Musanze',
  'Rulindo',
  // Southern Province
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Muhanga',
  'Nyamagabe',
  'Nyamasheke',
  'Nyanza',
  'Nyaruguru',
  'Ruhango',
  // Western Province
  'Karongi',
  'Ngororero',
  'Nyabihu',
  'Nyamasheke',
  'Rubavu',
  'Rusizi',
  'Rutsiro',
] as const;

export type RwandaDistrict = (typeof RWANDA_DISTRICTS)[number];
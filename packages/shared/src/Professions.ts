/**
 * Professions and skilled trades on BuildConnect Rwanda.
 * Used in profile setup, job post requirements, and search filters.
 */
export const PROFESSIONS = [
  // Licensed professionals
  'Civil Engineer',
  'Structural Engineer',
  'Architect',
  'Quantity Surveyor',
  'Site Engineer',
  'Land Surveyor',
  'Electrical Engineer',
  'Mechanical Engineer',
  'Environmental Engineer',
  // Skilled trades
  'Mason',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Welder',
  'Painter',
  'Roofer',
  'Steel Fixer',
  'Tiler',
  'Glazier',
  'Landscaper',
  // Business / company types
  'Construction Company',
  'Contractor',
  'Material Supplier',
  'Equipment Rental',
] as const;

export type Profession = (typeof PROFESSIONS)[number];

/**
 * Skills that can be added to any profile.
 * Kept separate from professions to allow cross-discipline tagging.
 */
export const SKILLS = [
  'AutoCAD',
  'Revit',
  'SketchUp',
  'Structural Analysis',
  'Cost Estimation',
  'Project Management',
  'Building Inspection',
  'Concrete Work',
  'Steel Fabrication',
  'Electrical Wiring',
  'Plumbing Installation',
  'Roofing',
  'Painting & Finishing',
  'Carpentry',
  'Welding',
  'Tile Setting',
  'Site Supervision',
  'Safety Management',
  'Green Building',
  'Interior Design',
] as const;

export type Skill = (typeof SKILLS)[number];
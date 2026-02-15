// ==========================================
// Subject Tags — User-Customizable
// ==========================================

export interface UserSubject {
  id: string;
  name: string;
  emoji: string;
  color: string; // Tailwind color class suffix
}

// ---- Palettes for auto-assignment ----

const EMOJI_PALETTE = [
  '📚', '📐', '💻', '🔬', '📝', '🎨', '🎵', '💪', '🌍', '📖',
  '🧪', '📊', '🎯', '✏️', '🔧', '🧠', '📓', '🔭', '🎒', '🏋️',
  '🧬', '⚙️', '🎹', '🖌️', '📈', '🗺️', '🧮', '🔐', '🎭', '📡',
];

const COLOR_PALETTE = [
  'blue', 'green', 'purple', 'amber', 'cyan',
  'pink', 'rose', 'indigo', 'emerald', 'orange',
  'slate',
];

// ---- Defaults for new users ----
// IDs match the old hardcoded ones so existing session data stays compatible
export const DEFAULT_SUBJECTS: UserSubject[] = [
  { id: 'math', name: 'Math', emoji: '📐', color: 'blue' },
  { id: 'science', name: 'Science', emoji: '🔬', color: 'green' },
  { id: 'english', name: 'English', emoji: '📝', color: 'purple' },
  { id: 'coding', name: 'Coding', emoji: '💻', color: 'cyan' },
  { id: 'reading', name: 'Reading', emoji: '📚', color: 'emerald' },
];

// ---- Limits ----

export const MAX_SUBJECTS = 20;
export const MAX_NAME_LENGTH = 24;
export const MIN_NAME_LENGTH = 1;

// ---- Validation & Sanitization ----

/**
 * Strip anything dangerous from user input.
 * - Removes HTML tags
 * - Removes characters commonly used in XSS: < > " ' ` \
 * - Blocks javascript: URIs and on*= event handlers
 * - Trims and caps length
 */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')        // strip HTML tags
    .replace(/[<>"'`\\]/g, '')      // remove dangerous chars
    .replace(/javascript:/gi, '')   // block JS protocol
    .replace(/on\w+\s*=/gi, '')     // block event handlers
    .trim()
    .substring(0, MAX_NAME_LENGTH);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized: string;
}

export function validateSubjectName(
  raw: string,
  existingSubjects: UserSubject[]
): ValidationResult {
  const sanitized = sanitizeInput(raw);

  if (sanitized.length < MIN_NAME_LENGTH) {
    return { valid: false, error: 'Name cannot be empty', sanitized };
  }
  if (sanitized.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Max ${MAX_NAME_LENGTH} characters`, sanitized };
  }
  // Only letters, numbers, spaces, hyphens, underscores, &, +, .
  if (!/^[a-zA-Z0-9\s\-_&+.]+$/.test(sanitized)) {
    return { valid: false, error: 'Only letters, numbers, spaces, and - _ & + . allowed', sanitized };
  }
  // Duplicate check (case-insensitive)
  const slug = slugify(sanitized);
  if (existingSubjects.some(s => s.id === slug)) {
    return { valid: false, error: 'Subject already exists', sanitized };
  }
  if (existingSubjects.length >= MAX_SUBJECTS) {
    return { valid: false, error: `Maximum ${MAX_SUBJECTS} subjects reached`, sanitized };
  }
  return { valid: true, sanitized };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30);
}

// ---- Subject Creation ----

export function createSubject(
  name: string,
  existingSubjects: UserSubject[]
): UserSubject {
  const sanitized = sanitizeInput(name);
  const id = slugify(sanitized);
  const idx = existingSubjects.length;

  return {
    id,
    name: sanitized,
    emoji: EMOJI_PALETTE[idx % EMOJI_PALETTE.length],
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  };
}

// ---- Lookup helpers ----

export function getSubjectFromList(
  id: string,
  subjects: UserSubject[]
): UserSubject | undefined {
  return subjects.find(s => s.id === id);
}

/**
 * Get Tailwind BG/border/text classes for a subject pill.
 * Accepts the color name directly (not the subject id).
 */
export function getSubjectBgClass(color: string, selected: boolean): string {
  const colorMap: Record<string, string> = {
    blue:    selected ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'       : 'bg-blue-500/10 border-blue-500/20 text-blue-400/70',
    green:   selected ? 'bg-green-500/30 border-green-500/50 text-green-300'    : 'bg-green-500/10 border-green-500/20 text-green-400/70',
    purple:  selected ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'bg-purple-500/10 border-purple-500/20 text-purple-400/70',
    amber:   selected ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'    : 'bg-amber-500/10 border-amber-500/20 text-amber-400/70',
    cyan:    selected ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'       : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400/70',
    pink:    selected ? 'bg-pink-500/30 border-pink-500/50 text-pink-300'       : 'bg-pink-500/10 border-pink-500/20 text-pink-400/70',
    rose:    selected ? 'bg-rose-500/30 border-rose-500/50 text-rose-300'       : 'bg-rose-500/10 border-rose-500/20 text-rose-400/70',
    indigo:  selected ? 'bg-indigo-500/30 border-indigo-500/50 text-indigo-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400/70',
    emerald: selected ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/70',
    orange:  selected ? 'bg-orange-500/30 border-orange-500/50 text-orange-300' : 'bg-orange-500/10 border-orange-500/20 text-orange-400/70',
    slate:   selected ? 'bg-slate-500/30 border-slate-500/50 text-slate-300'    : 'bg-slate-500/10 border-slate-500/20 text-slate-400/70',
  };
  return colorMap[color] || colorMap.slate;
}

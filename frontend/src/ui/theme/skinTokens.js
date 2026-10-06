// -----------------------------------------------------------------------------
// 1. COLOR TOKENS & PALETTES
// -----------------------------------------------------------------------------

/** Minimalist clean light palette */
export const LightSkinColors = Object.freeze({
  background: '#F2F3F5',      // Screen canvas
  bg: '#F2F3F5',              // Short alias
  surface: '#FBFBFC',         // Cards and main containers
  surfaceVariant: '#E9EAED',  // Chips, inputs, secondary buttons
  border: '#E3E4E8',          // Hairline 1.dp card outline
  ink: '#111111',             // Inverted high-contrast pill / action button
  onInk: '#FFFFFF',           // Text/icon on ink
  textPrimary: '#111111',     // Main headings & body
  textSecondary: '#8A8A8E',   // Subtitles, metadata, timestamps
  accent: '#E53935',          // Signature Red
  accentSecondary: '#FFB300', // Bauhaus Sun Gold
  gold: '#FFB300',            // Short alias
  accentTertiary: '#1976D2',  // Bauhaus Electric Azure Blue
  azure: '#1976D2',           // Short alias
  track: '#DCDDE0',           // Sliders, progress bars, troughs
  shadow: 'rgba(0, 0, 0, 0.08)', // Subtle drop shadow tint (0x14000000)
  isDark: false,
  isGlyph: false,
});

/** Pitch Black 100% AMOLED dark palette */
export const DarkSkinColors = Object.freeze({
  background: '#000000',      // Pitch Black AMOLED
  bg: '#000000',              // Short alias
  surface: '#0E0E11',         // Deep near-black for cards
  surfaceVariant: '#1B1B1F',  // Dark slate for chips/inputs
  border: '#26262B',          // Subtle hairline border
  ink: '#FFFFFF',             // High contrast pure white
  onInk: '#000000',           // Pure black on ink
  textPrimary: '#FBFBFB',     // Crisp white text
  textSecondary: '#8E8E93',   // Clean secondary grey
  accent: '#FF453A',          // Pure vibrant red
  accentSecondary: '#FFD60A', // Vibrant amber gold
  gold: '#FFD60A',            // Short alias
  accentTertiary: '#0A84FF',  // Vibrant cyan blue
  cyan: '#0A84FF',            // Short alias
  azure: '#0A84FF',           // Short alias
  track: '#1E1E22',
  shadow: 'rgba(0, 0, 0, 0.50)', // 0x80000000
  isDark: true,
  isGlyph: false,
});

/** Bauhaus / Nothing OS inspired dark graphite palette */
export const GlyphSkinColors = Object.freeze({
  background: '#222326',      // Dark graphite canvas
  bg: '#222326',              // Short alias
  surface: '#18191C',         // Deep matte card surface
  surfaceVariant: '#2D3036',  // Slate graphite for controls/chips
  border: '#3E4249',          // Distinct hairline border
  ink: '#E5252A',             // Signature Nothing Red primary pill
  onInk: '#FFFFFF',           // Crisp white
  textPrimary: '#FFFFFF',     // Bright readable text
  textSecondary: '#A6ABB4',   // Refined secondary text
  accent: '#E5252A',          // Signature Red
  accentSecondary: '#FFB800', // Bauhaus Sun Gold
  gold: '#FFB800',            // Short alias
  accentTertiary: '#0066CC',  // Bauhaus Electric Azure
  azure: '#0066CC',           // Short alias
  track: '#383B42',
  shadow: 'rgba(0, 0, 0, 0.40)', // 0x66000000
  isDark: true,
  isGlyph: true,
});

/** Bridges SkinColors to Material Scheme so dialogs, menus, and sheets match */
export function toMaterialScheme(colors) {
  const c = colors || LightSkinColors;
  const isDark = Boolean(c.isDark);
  return Object.freeze({
    primary: c.ink,
    onPrimary: c.onInk,
    primaryContainer: c.surfaceVariant,
    onPrimaryContainer: c.textPrimary,
    secondary: c.accent,
    onSecondary: '#FFFFFF',
    tertiary: c.accentSecondary,
    background: c.background,
    onBackground: c.textPrimary,
    surface: c.surface,
    onSurface: c.textPrimary,
    surfaceVariant: c.surfaceVariant,
    onSurfaceVariant: c.textSecondary,
    outline: c.border,
    outlineVariant: c.track,
    error: c.accent,
    onError: '#FFFFFF',
    surfaceContainer: c.surface,
    surfaceContainerLowest: c.background,
    surfaceContainerHigh: c.surfaceVariant,
    isDark,
  });
}

// -----------------------------------------------------------------------------
// 2. TYPOGRAPHY TOKENS (Dot Matrix & Modern Sans)
// -----------------------------------------------------------------------------

export const SkinTypography = Object.freeze({
  // Dot-Matrix / Tech Headline Tokens
  heroDot: Object.freeze({
    fontFamily: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 900,
    fontSize: '38px',
    lineHeight: '40px',
    letterSpacing: '1px',
  }),
  screenDot: Object.freeze({
    fontFamily: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 700,
    fontSize: '26px',
    lineHeight: '30px',
    letterSpacing: '1px',
  }),
  cardDot: Object.freeze({
    fontFamily: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 700,
    fontSize: '18px',
    lineHeight: '22px',
    letterSpacing: '0.5px',
  }),
  badgeDot: Object.freeze({
    fontFamily: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '14px',
    letterSpacing: '0.5px',
  }),

  // Modern Sans Tokens
  titleLarge: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: '24px',
  }),
  titleMedium: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '20px',
  }),
  bodyLarge: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '20px',
  }),
  bodyMedium: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '18px',
  }),
  bodyStrong: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 500,
    fontSize: '13px',
    lineHeight: '18px',
  }),
  caption: Object.freeze({
    fontFamily: "var(--font-sans, 'Inter', 'Manrope', sans-serif)",
    fontWeight: 400,
    fontSize: '11px',
    lineHeight: '14px',
    letterSpacing: '0.3px',
  }),
});

export function toMaterialTypography(typography = SkinTypography) {
  const t = typography || SkinTypography;
  return Object.freeze({
    headlineLarge: t.heroDot,
    headlineMedium: t.screenDot,
    titleMedium: t.titleMedium,
    bodyLarge: t.bodyLarge,
    bodyMedium: t.bodyMedium,
    labelSmall: t.caption,
  });
}

// -----------------------------------------------------------------------------
// 3. DIMENSIONS, RADII & SHAPE TOKENS
// -----------------------------------------------------------------------------

export const SkinTokens = Object.freeze({
  // Spacing
  spaceXs: '4px',
  spaceSm: '8px',
  spaceMd: '12px',
  spaceLg: '16px',
  spaceXl: '20px',
  spaceXxl: '24px',
  spacing: Object.freeze({
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  }),

  // Corner Radii
  radiusCard: '22px',
  radiusButton: '14px',
  radiusCapsule: '34px',
  radiusPill: '50px',
  radiusBadge: '8px',
  radius: Object.freeze({
    card: '22px',
    button: '14px',
    capsule: '34px',
    pill: '50px',
    badge: '8px',
  }),

  // Hairlines & Borders
  borderWidthHairline: '1px',
  borderWidthThick: '2px',
  border: Object.freeze({
    hairline: '1px',
    thick: '2px',
  }),

  // Pre-built style objects
  cardShape: Object.freeze({ borderRadius: '22px' }),
  buttonShape: Object.freeze({ borderRadius: '14px' }),
  capsuleShape: Object.freeze({ borderRadius: '34px' }),
  pillShape: Object.freeze({ borderRadius: '50px' }),
  badgeShape: Object.freeze({ borderRadius: '8px' }),
});

// -----------------------------------------------------------------------------
// 4. THEME MODES & UTILITIES
// -----------------------------------------------------------------------------

export const SkinThemeMode = Object.freeze({
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
  GLYPH: 'glyph',
});

export function isSystemInDarkTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function colorWithAlpha(color, alpha = 1) {
  if (!color) return `rgba(255, 179, 0, ${alpha})`;
  const trimmed = String(color).trim();
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }
  }
  if (trimmed.startsWith('rgb(')) {
    return trimmed.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  if (trimmed.startsWith('rgba(')) {
    return trimmed.replace(/[\d.]+\)$/, `${alpha})`);
  }
  // CSS variables (e.g., var(--skin-accent)) or named colors
  return `color-mix(in srgb, ${trimmed} ${Math.round(alpha * 100)}%, transparent)`;
}

// Active theme state container for direct SkinTheme.colors / SkinTheme.type / SkinTheme.tokens access
let activeThemeSnapshot = {
  colors: LightSkinColors,
  type: SkinTypography,
  tokens: SkinTokens,
  themeMode: SkinThemeMode.LIGHT,
};

export function updateThemeSnapshot(snapshotOrMode) {
  if (typeof snapshotOrMode === 'string') {
    const mode = snapshotOrMode.toLowerCase();
    let colors = LightSkinColors;
    if (mode === SkinThemeMode.GLYPH) {
      colors = GlyphSkinColors;
    } else if (mode === SkinThemeMode.DARK) {
      colors = DarkSkinColors;
    } else if (mode === SkinThemeMode.SYSTEM) {
      colors = isSystemInDarkTheme() ? DarkSkinColors : LightSkinColors;
    }
    activeThemeSnapshot = {
      ...activeThemeSnapshot,
      themeMode: snapshotOrMode,
      colors,
    };
  } else if (snapshotOrMode && typeof snapshotOrMode === 'object') {
    activeThemeSnapshot = { ...activeThemeSnapshot, ...snapshotOrMode };
  }
}

export function getActiveThemeSnapshot() {
  return activeThemeSnapshot;
}

export const SkinTheme = {
  get colors() {
    return activeThemeSnapshot.colors;
  },
  get type() {
    return activeThemeSnapshot.type;
  },
  get tokens() {
    return activeThemeSnapshot.tokens;
  },
  get mode() {
    return activeThemeSnapshot.themeMode;
  },
  get isDark() {
    return Boolean(activeThemeSnapshot.colors?.isDark);
  },
  get isGlyph() {
    return Boolean(activeThemeSnapshot.colors?.isGlyph);
  },
  toMaterialScheme(colors = activeThemeSnapshot.colors) {
    return toMaterialScheme(colors);
  },
  toMaterialTypography(type = activeThemeSnapshot.type) {
    return toMaterialTypography(type);
  },
};

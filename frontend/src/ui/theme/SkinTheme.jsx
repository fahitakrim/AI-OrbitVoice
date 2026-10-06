import { useEffect, useMemo, useState } from 'react';
import {
  LightSkinColors,
  DarkSkinColors,
  GlyphSkinColors,
  SkinTypography,
  SkinTokens,
  SkinThemeMode,
  updateThemeSnapshot,
  getActiveThemeSnapshot,
  isSystemInDarkTheme,
  colorWithAlpha,
  toMaterialScheme,
  toMaterialTypography,
} from './skinTokens';
import { SkinThemeContext, useSkinTheme } from './useSkinTheme';

/**
 * Root theme wrapper for the application.
 * Accepts themeMode (SYSTEM, LIGHT, DARK, GLYPH), darkTheme override, and custom typography/tokens.
 * Synchronizes HTML document attributes, CSS custom properties, and static SkinTheme getters.
 */
export function SkinTheme({
  themeMode: propMode,
  darkTheme,
  typography = SkinTypography,
  tokens = SkinTokens,
  setThemeMode: propSetMode,
  children,
}) {
  const [internalMode, setInternalMode] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('vo_theme');
      if (saved) return saved;
    }
    return propMode || SkinThemeMode.SYSTEM;
  });

  const [systemIsDark, setSystemIsDark] = useState(() => isSystemInDarkTheme());

  // Listen to OS dark mode changes when in SYSTEM theme mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeMode = propMode !== undefined ? propMode : internalMode;
  const setActiveMode = propSetMode !== undefined ? propSetMode : setInternalMode;

  const normalizedMode = (String(activeMode) || 'system').toLowerCase();

  const isDarkEffective = darkTheme !== undefined
    ? Boolean(darkTheme)
    : systemIsDark;

  // Resolve active palette
  const colors = useMemo(() => {
    if (normalizedMode === 'glyph' || normalizedMode === SkinThemeMode.GLYPH) {
      return GlyphSkinColors;
    }
    if (normalizedMode === 'dark' || normalizedMode === SkinThemeMode.DARK) {
      return DarkSkinColors;
    }
    if (normalizedMode === 'light' || normalizedMode === SkinThemeMode.LIGHT) {
      return LightSkinColors;
    }
    // SYSTEM
    return isDarkEffective ? DarkSkinColors : LightSkinColors;
  }, [normalizedMode, isDarkEffective]);

  // Sync document root attributes, mobile status bar meta, and CSS custom properties
  useEffect(() => {
    updateThemeSnapshot({
      colors,
      type: typography,
      tokens,
      themeMode: activeMode,
    });

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const dataThemeValue = normalizedMode === 'system'
        ? (colors.isDark ? 'dark' : 'light')
        : normalizedMode;
      root.setAttribute('data-theme', dataThemeValue);
      root.style.colorScheme = colors.isDark ? 'dark' : 'light';

      // Mobile address bar & status bar tint
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.content = colors.background;

      // CSS custom property token bridges
      root.style.setProperty('--skin-bg', colors.background);
      root.style.setProperty('--skin-surface', colors.surface);
      root.style.setProperty('--skin-surface-variant', colors.surfaceVariant);
      root.style.setProperty('--skin-border', colors.border);
      root.style.setProperty('--skin-ink', colors.ink);
      root.style.setProperty('--skin-on-ink', colors.onInk);
      root.style.setProperty('--skin-text-primary', colors.textPrimary);
      root.style.setProperty('--skin-text-secondary', colors.textSecondary);
      root.style.setProperty('--skin-accent', colors.accent);
      root.style.setProperty('--skin-accent-secondary', colors.accentSecondary);
      root.style.setProperty('--skin-accent-tertiary', colors.accentTertiary);
      root.style.setProperty('--skin-track', colors.track);
      root.style.setProperty('--skin-shadow', colors.shadow);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vo_theme', activeMode);
    }
  }, [activeMode, normalizedMode, colors, typography, tokens]);

  const contextValue = useMemo(() => ({
    themeMode: activeMode,
    setThemeMode: setActiveMode,
    colors,
    type: typography,
    tokens,
    isDark: colors.isDark,
    isGlyph: colors.isGlyph,
    toMaterialScheme: () => toMaterialScheme(colors),
    toMaterialTypography: () => toMaterialTypography(typography),
  }), [activeMode, setActiveMode, colors, typography, tokens]);

  return (
    <SkinThemeContext.Provider value={contextValue}>
      {children}
    </SkinThemeContext.Provider>
  );
}

// Attach static properties so SkinTheme.colors, SkinTheme.type, SkinTheme.tokens work globally
Object.defineProperties(SkinTheme, {
  colors: {
    get: () => getActiveThemeSnapshot().colors,
    enumerable: true,
  },
  type: {
    get: () => getActiveThemeSnapshot().type,
    enumerable: true,
  },
  tokens: {
    get: () => getActiveThemeSnapshot().tokens,
    enumerable: true,
  },
  mode: {
    get: () => getActiveThemeSnapshot().themeMode,
    enumerable: true,
  },
  isDark: {
    get: () => Boolean(getActiveThemeSnapshot().colors?.isDark),
    enumerable: true,
  },
  isGlyph: {
    get: () => Boolean(getActiveThemeSnapshot().colors?.isGlyph),
    enumerable: true,
  },
  toMaterialScheme: {
    value: (c = getActiveThemeSnapshot().colors) => toMaterialScheme(c),
    enumerable: true,
  },
  toMaterialTypography: {
    value: (t = getActiveThemeSnapshot().type) => toMaterialTypography(t),
    enumerable: true,
  },
});

/** Backward compatibility alias */
export const SkinThemeProvider = SkinTheme;

// -----------------------------------------------------------------------------
// READY-TO-USE SKIN PRIMITIVES
// -----------------------------------------------------------------------------

/**
 * Standard Neumorphic Skin Card with hairline border and 22.dp rounded corners
 */
export function SkinCard({
  children,
  content,
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const { colors, tokens } = useSkinTheme();

  return (
    <div
      className={`skin-card ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        border: `${tokens.borderWidthHairline} solid ${colors.border}`,
        borderRadius: tokens.radiusCard,
        padding: tokens.spaceLg,
        boxShadow: `0 4px 20px ${colors.shadow}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
      {...rest}
    >
      {typeof content === 'function' ? content() : (content || children)}
    </div>
  );
}

/**
 * Inverted high-contrast pill button (50.dp radius)
 */
export function SkinPillButton({
  children,
  text,
  onClick,
  className = '',
  style = {},
  disabled = false,
  variant = 'ink', // 'ink' | 'accent' | 'outline'
  ...rest
}) {
  const { colors, tokens, type } = useSkinTheme();

  const getVariantStyles = () => {
    if (variant === 'accent') {
      return {
        bg: colors.accent,
        color: '#FFFFFF',
        border: 'none',
      };
    }
    if (variant === 'outline') {
      return {
        bg: 'transparent',
        color: colors.textPrimary,
        border: `${tokens.borderWidthHairline} solid ${colors.border}`,
      };
    }
    // Default high-contrast ink pill
    return {
      bg: colors.ink,
      color: colors.onInk,
      border: 'none',
    };
  };

  const v = getVariantStyles();

  return (
    <button
      type="button"
      className={`skin-pill-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...type.bodyStrong,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.4rem',
        borderRadius: tokens.radiusPill,
        backgroundColor: v.bg,
        color: v.color,
        border: v.border,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: disabled ? 'none' : `0 2px 8px ${colors.shadow}`,
        ...style,
      }}
      {...rest}
    >
      {text || children}
    </button>
  );
}

/**
 * Translucent Glyph badge with colored border and dot-matrix label
 */
export function SkinGlyphBadge({
  label,
  children,
  color,
  className = '',
  style = {},
  ...rest
}) {
  const { colors, tokens, type } = useSkinTheme();
  const badgeColor = color || colors.accentSecondary;

  return (
    <span
      className={`skin-glyph-badge ${className}`}
      style={{
        ...type.badgeDot,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '4px 10px',
        borderRadius: tokens.radiusPill,
        backgroundColor: colorWithAlpha(badgeColor, 0.16),
        border: `1px solid ${colorWithAlpha(badgeColor, 0.5)}`,
        color: badgeColor,
        textTransform: 'uppercase',
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      {label || children}
    </span>
  );
}

/**
 * Secondary / control button with 14.dp radius
 */
export function SkinButton({
  children,
  onClick,
  className = '',
  style = {},
  disabled = false,
  ...rest
}) {
  const { colors, tokens, type } = useSkinTheme();

  return (
    <button
      type="button"
      className={`skin-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...type.bodyMedium,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        padding: '0.5rem 1rem',
        borderRadius: tokens.radiusButton,
        backgroundColor: colors.surfaceVariant,
        color: colors.textPrimary,
        border: `${tokens.borderWidthHairline} solid ${colors.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Surface container with SkinTheme card radius and surface/variant colors
 */
export function SkinSurface({
  children,
  variant = 'surface', // 'surface' | 'variant'
  className = '',
  style = {},
  ...rest
}) {
  const { colors, tokens } = useSkinTheme();
  const bg = variant === 'variant' ? colors.surfaceVariant : colors.surface;
  return (
    <div
      className={`skin-surface ${className}`}
      style={{
        backgroundColor: bg,
        border: `${tokens.borderWidthHairline} solid ${colors.border}`,
        borderRadius: tokens.radiusCard,
        padding: tokens.spaceLg,
        boxShadow: `0 4px 20px ${colors.shadow}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Rounded Chip with pill radius
 */
export function SkinChip({
  children,
  label,
  className = '',
  style = {},
  onClick,
  active = false,
  ...rest
}) {
  const { colors, tokens, type } = useSkinTheme();
  return (
    <span
      className={`skin-chip ${className}`}
      onClick={onClick}
      style={{
        ...type.bodyMedium,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: tokens.radiusPill,
        backgroundColor: active ? colors.ink : colors.surfaceVariant,
        color: active ? colors.onInk : colors.textPrimary,
        border: `${tokens.borderWidthHairline} solid ${colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        fontSize: '0.74rem',
        userSelect: 'none',
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {label || children}
    </span>
  );
}

/**
 * Text component with SkinTypography tokens and colors
 */
export function SkinText({
  variant = 'bodyLarge',
  color = 'primary', // 'primary' | 'secondary' | 'accent' | 'ink'
  children,
  as: Component = 'span',
  className = '',
  style = {},
  ...rest
}) {
  const { colors, type } = useSkinTheme();
  const typeStyle = type[variant] || type.bodyLarge;
  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    accent: colors.accent,
    gold: colors.accentSecondary,
    azure: colors.accentTertiary,
    ink: colors.ink,
    onInk: colors.onInk,
  };
  const textColor = colorMap[color] || color;

  return (
    <Component
      className={`skin-text ${className}`}
      style={{
        ...typeStyle,
        color: textColor,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

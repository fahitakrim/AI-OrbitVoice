import assert from 'node:assert';
import {
  LightSkinColors,
  DarkSkinColors,
  GlyphSkinColors,
  SkinTypography,
  SkinTokens,
  SkinThemeMode,
  SkinTheme,
  updateThemeSnapshot
} from './src/ui/theme/skinTokens.js';

console.log('Testing SkinTheme tokens and architecture...');

// 1. Check SkinThemeMode
assert.strictEqual(SkinThemeMode.LIGHT, 'light');
assert.strictEqual(SkinThemeMode.DARK, 'dark');
assert.strictEqual(SkinThemeMode.GLYPH, 'glyph');

// 2. Check LightSkinColors
assert.strictEqual(LightSkinColors.bg, '#F2F3F5');
assert.strictEqual(LightSkinColors.surface, '#FBFBFC');
assert.strictEqual(LightSkinColors.surfaceVariant, '#E9EAED');
assert.strictEqual(LightSkinColors.border, '#E3E4E8');
assert.strictEqual(LightSkinColors.ink, '#111111');
assert.strictEqual(LightSkinColors.onInk, '#FFFFFF');
assert.strictEqual(LightSkinColors.accent, '#E53935');
assert.strictEqual(LightSkinColors.gold, '#FFB300');
assert.strictEqual(LightSkinColors.azure, '#1976D2');

// 3. Check DarkSkinColors (AMOLED)
assert.strictEqual(DarkSkinColors.bg, '#000000');
assert.strictEqual(DarkSkinColors.surface, '#0E0E11');
assert.strictEqual(DarkSkinColors.surfaceVariant, '#1B1B1F');
assert.strictEqual(DarkSkinColors.border, '#26262B');
assert.strictEqual(DarkSkinColors.ink, '#FFFFFF');
assert.strictEqual(DarkSkinColors.onInk, '#000000');
assert.strictEqual(DarkSkinColors.accent, '#FF453A');
assert.strictEqual(DarkSkinColors.gold, '#FFD60A');
assert.strictEqual(DarkSkinColors.cyan, '#0A84FF');

// 4. Check GlyphSkinColors (Nothing OS / Bauhaus)
assert.strictEqual(GlyphSkinColors.bg, '#222326');
assert.strictEqual(GlyphSkinColors.surface, '#18191C');
assert.strictEqual(GlyphSkinColors.surfaceVariant, '#2D3036');
assert.strictEqual(GlyphSkinColors.border, '#3E4249');
assert.strictEqual(GlyphSkinColors.ink, '#E5252A');
assert.strictEqual(GlyphSkinColors.onInk, '#FFFFFF');
assert.strictEqual(GlyphSkinColors.accent, '#E5252A');
assert.strictEqual(GlyphSkinColors.gold, '#FFB800');
assert.strictEqual(GlyphSkinColors.azure, '#0066CC');

// 5. Check SkinTokens
assert.strictEqual(SkinTokens.radius.card, '22px');
assert.strictEqual(SkinTokens.radius.button, '14px');
assert.strictEqual(SkinTokens.radius.pill, '50px');
assert.strictEqual(SkinTokens.border.hairline, '1px');

// 6. Check SkinTypography
assert.ok(SkinTypography.heroDot.fontFamily.includes('Space Mono'));
assert.ok(SkinTypography.titleLarge.fontFamily.includes('Inter'));
assert.strictEqual(SkinTypography.heroDot.letterSpacing, '1px');
assert.strictEqual(SkinTypography.screenDot.letterSpacing, '1px');

// 7. Check SkinTheme dynamic getter and snapshot sync
updateThemeSnapshot(SkinThemeMode.LIGHT);
assert.strictEqual(SkinTheme.mode, SkinThemeMode.LIGHT);
assert.strictEqual(SkinTheme.isDark, false);
assert.strictEqual(SkinTheme.isGlyph, false);
assert.strictEqual(SkinTheme.colors.bg, '#F2F3F5');

updateThemeSnapshot(SkinThemeMode.DARK);
assert.strictEqual(SkinTheme.mode, SkinThemeMode.DARK);
assert.strictEqual(SkinTheme.isDark, true);
assert.strictEqual(SkinTheme.isGlyph, false);
assert.strictEqual(SkinTheme.colors.bg, '#000000');

updateThemeSnapshot(SkinThemeMode.GLYPH);
assert.strictEqual(SkinTheme.mode, SkinThemeMode.GLYPH);
assert.strictEqual(SkinTheme.isDark, true);
assert.strictEqual(SkinTheme.isGlyph, true);
assert.strictEqual(SkinTheme.colors.bg, '#222326');
assert.strictEqual(SkinTheme.colors.ink, '#E5252A');

console.log('✓ All 7 SkinTheme unit test suites passed successfully!');

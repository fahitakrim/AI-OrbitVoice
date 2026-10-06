import { createContext, useContext } from 'react';
import { LightSkinColors, SkinTypography, SkinTokens, SkinThemeMode } from './skinTokens';

export const SkinThemeContext = createContext({
  themeMode: SkinThemeMode.LIGHT,
  setThemeMode: () => {},
  colors: LightSkinColors,
  type: SkinTypography,
  tokens: SkinTokens,
  isDark: false,
  isGlyph: false,
});

export function useSkinTheme() {
  return useContext(SkinThemeContext);
}

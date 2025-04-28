// This file allows importing the theme configuration from a JSON file.

import theme from './theme.json';
import * as Colors from './colors';

const processThemeColors = (themeObj) => {
  const processed = { ...themeObj };
  
  Object.keys(processed.colors).forEach(category => {
    Object.keys(processed.colors[category]).forEach(key => {
      const value = processed.colors[category][key];
      if (Colors[value]) {
        processed.colors[category][key] = Colors[value];
      }
    });
  });

  return processed;
};

const processedTheme = processThemeColors(theme);

export const colors = processedTheme.colors;
export const spacing = theme.spacing;
export const borderRadius = theme.borderRadius;

export default processedTheme;
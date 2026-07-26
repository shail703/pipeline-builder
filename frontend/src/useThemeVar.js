// useThemeVar.js
// Reads a CSS custom property and re-reads it whenever the theme
// (the data-theme attribute on <html>) changes.
//
// Why this exists: most of the UI is styled in CSS and re-themes for
// free. But some things — like ReactFlow's <Background /> grid — are
// drawn from a color *string prop*, not CSS, so they can't pick up a
// token automatically. This hook bridges that gap, keeping such
// props in sync with the active theme without coupling components to
// the toggle's state.

import { useState, useEffect } from 'react';

export const useThemeVar = (varName, fallback = '') => {
  const read = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || fallback;

  const [value, setValue] = useState(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setValue(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varName, fallback]);

  return value;
};

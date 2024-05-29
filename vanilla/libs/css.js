const styleCache = new Map();

export const AdoptableStyles = Object.freeze({
  for(cssText) {
    let sheet = styleCache.get(cssText);

    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      styleCache.set(cssText, sheet);
    }

    return sheet;
  }
});

export function cssCache(style) {
  return AdoptableStyles.for(style.trim());
}
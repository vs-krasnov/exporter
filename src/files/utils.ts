import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import { NamingHelper, CSSHelper } from "@supernovaio/export-helpers"
import { exportConfiguration } from ".."
import { ColorTokenValue, ColorValue } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/tokens/SDKTokenValue"

export enum Theme { LIGHTMODE = "Lightmode", DARKMODE = "Darkmode" }
export const MEASURE_PREFIX = "measure"
export const BORDER_PREFIX = "border"

export function generateInitialContent(figmaUrl: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n
    <!-- WARNING: This file was automatically generated. Do not modify it manually, as changes may be overwritten. To update this file, edit the source data and regenerate it.
    tokens are available here: ${figmaUrl}
    extractor is available here: https://github.com/blablacar/supernova-extractors -->\n`
}

export function extractColorCategory(token: string): string | null {
  const match = token.match(/color(?:Lightmode|Darkmode)([A-Za-z]+?)(Txt|Icon|Bg|Border)/);
  return match ? match[1] : null; // Extract only the category name
}

export function filterTokensByCategoryAndTheme(tokens: Token[], tokenGroups: Array<TokenGroup>, category: string, theme: Theme): Token[] {

  const tokenCategory = tokens.filter((token) => {
    const prefix = exportConfiguration.tokenPrefixes[token.tokenType]
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
    if (parent !== undefined) {
      const name = NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
      return name.toLocaleLowerCase().includes(category.toLowerCase())
    }
  })
  
  return tokenCategory.filter((token) => {
    const prefix = exportConfiguration.tokenPrefixes[token.tokenType]
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!!
    const name = NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
    return name.includes(theme)
  })
}

export function getTokenColorValue(token: Token, tokens: Token[], tokenGroups: Array<TokenGroup>): string {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${getTokenName(t, tokenGroups)})`
    },
  })
  
  return `${transformAlphaHexValues(value).toUpperCase()}`
}

export function transformAlphaHexValues(value: string): string {
  if (value.length === 9) { // Format: #RRGGBBAA
    return `#${value.slice(7, 9)}${value.slice(1, 7)}`; // Convert to #AARRGGBB
  }
  return value
}

export function getTokenSizeValue(token: Token, tokens: Token[], tokenGroups: Array<TokenGroup>): string {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${getTokenName(t, tokenGroups)})`
    },
  })
  
  return `${value.toLowerCase().replace("px", "")}`
}

export function getTokenName(token: Token, tokenGroups: Array<TokenGroup>): string {
  const prefix = exportConfiguration.tokenPrefixes[token.tokenType]
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!!
  const name = NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix).replace(/Lightmode|Darkmode/, "")
  return name
}

export const colorTokenToAndroidHex = (colorToken: ColorValue, opacityValue: number): string => {
  const { r, g, b } = colorToken;
  const alpha = Math.round(opacityValue * 255); // Convert opacity to 0-255 range

  // Convert each component to a two-character hex string
  const toHex = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(alpha)}${toHex(r)}${toHex(g)}${toHex(b)}`;
};
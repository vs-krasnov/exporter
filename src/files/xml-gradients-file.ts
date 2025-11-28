import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenGroup, TokenType, ColorTokenValue, ColorToken } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { NamingHelper, CSSHelper } from "@supernovaio/export-helpers"
import { generateInitialContent, Theme, extractColorCategory, filterTokensByCategoryAndTheme, getTokenName, getTokenColorValue, transformAlphaHexValues } from "./utils";

interface GradientToken {
  name: string;
  gradient: string;
}

interface Gradient {
  angle: number; 
  startColor: string; 
  endColor: string
}

const startSuffix = "Start"
const endSuffix = "End"

function extractCategories(tokens: Token[], tokenGroups: TokenGroup[]): string[] {
  const colorNames = tokens
    .map(token => {
      const prefix = exportConfiguration.tokenPrefixes[token.tokenType];
      const parent = tokenGroups.find(group => group.id === token.parentGroupId); 
      return parent
        ? NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
        : null;
    })
    .filter((name): name is string => name !== null) // Type guard to remove null values
    .map(extractColorCategory)
    .filter((category): category is string => category !== null); // Type guard again

  return Array.from(new Set(colorNames)); // Remove duplicates efficiently
}

function generateGradientDrawable(name: string, colorName: string, startColor: string, endColor: string, angle: number): OutputTextFile {
  var content = `<?xml version="1.0" encoding="utf-8"?>\n`
  content += `    <!-- WARNING: This file was automatically generated. Do not modify it manually, as changes may be overwritten. To update this file, edit the source data and regenerate it.
    tokens are available here: https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.27?node-id=21601-41807&t=rk1MwQ5phnc3o16B∏-0
    extractor is available here: https://github.com/blablacar/supernova-extractors -->\n
    <shape xmlns:android="http://schemas.android.com/apk/res/android">
        <gradient
            android:angle="${angle}"
            android:startColor="@color/${colorName + startSuffix}"
            android:endColor="@color/${colorName + endSuffix}" />
    </shape>
`;

  return FileHelper.createTextFile({
      relativePath: exportConfiguration.baseStyleFilePath + "/drawable",
      fileName: name + ".xml",
      content: content,
    })
}

function gradientToFileName(name: string): string {
  return name
    .replace(/^color/, "gradient") // Replace "color" with "gradient"
    .replace(/([A-Z])/g, "_$1") // Insert "_" before uppercase letters
    .toLowerCase() // Convert to lowercase
    .replace(/^_/, ""); // Remove leading underscore if present
}

function parseGradient(gradient: string): Gradient | null {
  const match = gradient.match(/linear-gradient\((\d+)deg, (#[A-Fa-f0-9]{6,8})\s*\d*\.?\d*%?\s*,\s*(#[A-Fa-f0-9]{6,8})\s*\d*\.?\d*%?\s*\)/);
  if (!match) return null;
  
  return {
    angle: (parseInt(match[1]) + 90) % 360, // Convert CSS to Android angles
    startColor: transformAlphaHexValues(match[2]),
    endColor: transformAlphaHexValues(match[3]),
  };
}

function generateSuffixedGradientColor(token: Token, tokenGroups: Array<TokenGroup>, gradient: Gradient, suffix: string) : string {
  return `    <color name="${getTokenName(token, tokenGroups) + suffix}">${gradient?.startColor.toUpperCase()}</color>\n`
}

function generateDrawableGradientColor(token: Token, tokenGroups: Array<TokenGroup>): string {
  return `    <item name="${getTokenName(token, tokenGroups)}" type="drawable">@drawable/${gradientToFileName(getTokenName(token, tokenGroups))}</item>\n`;
}

export function xmlGradientsOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {
  let files: Array<OutputTextFile> = []
  let categories = extractCategories(tokens, tokenGroups)
  var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.27?node-id=21601-41807&t=rk1MwQ5phnc3o16B∏-0")

  categories.forEach(category => {
    content += `\n    <!-- Foundation Tokens ${category} -->\n`;
    const categoryTokens = filterTokensByCategoryAndTheme(tokens, tokenGroups, category, Theme.LIGHTMODE)
    const gradientTokens: GradientToken[] = []
    categoryTokens.forEach((token) => {
      gradientTokens.push({name: getTokenName(token, tokenGroups), gradient: getTokenColorValue(token, tokens, tokenGroups)})
      const gradient = parseGradient(getTokenColorValue(token, tokens, tokenGroups).toLowerCase())
      if (gradient) {
        files.push(generateGradientDrawable(gradientToFileName(getTokenName(token, tokenGroups)), getTokenName(token, tokenGroups), gradient.startColor, gradient.endColor, gradient.angle))
        content += generateDrawableGradientColor(token, tokenGroups)
        content += generateSuffixedGradientColor(token, tokenGroups, gradient, startSuffix)
        content += generateSuffixedGradientColor(token, tokenGroups, gradient, endSuffix)
      }
    })
  })

  content += `</resources>\n`;

  return [...files, FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath + "/values",
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  })]
}
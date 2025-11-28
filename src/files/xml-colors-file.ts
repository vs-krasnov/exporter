import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenGroup, TokenType, ColorTokenValue, ColorToken } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { NamingHelper, CSSHelper } from "@supernovaio/export-helpers"
import { generateInitialContent, Theme, extractColorCategory, filterTokensByCategoryAndTheme, getTokenColorValue, getTokenName } from "./utils";

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

export function xmlColorsOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

  let categories = extractCategories(tokens, tokenGroups)
  var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.27?node-id=21601-41807&t=rk1MwQ5phnc3o16B∏-0")

  categories.forEach(category => {
    content += `\n    <!-- Foundation Tokens ${category} -->\n`;
    const categoryTokens = filterTokensByCategoryAndTheme(tokens, tokenGroups, category, Theme.LIGHTMODE)
    categoryTokens.forEach((token) => {
      content += `    <color name="${getTokenName(token, tokenGroups)}">${getTokenColorValue(token, tokens, tokenGroups)}</color>\n`;
    })
  })

  content += `</resources>\n`;

  return [FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath + "/values",
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  })]
}
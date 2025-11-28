import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { getTokenSizeValue, generateInitialContent, getTokenName, MEASURE_PREFIX } from "./utils";

export function xmlSpacingOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

  var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.27?node-id=21601-41807&t=rk1MwQ5phnc3o16B∏-0") + `\n`

  tokens
    .map(token => {
      const parent = tokenGroups.find(group => group.id === token.parentGroupId);
      return parent
        ? token
        : null;
    })
    .forEach(token => {
      if (token != null) {
        let name = getTokenName(token, tokenGroups)
        name = name.charAt(0).toLocaleUpperCase() + name.slice(1)
        const value = getTokenSizeValue(token, tokens, tokenGroups)
        content += `    <dimen name="${MEASURE_PREFIX}${name}">${value}dp</dimen>\n`;
      }
    })

  content += `</resources>\n`;

  return [FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath + "/values",
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  })]
}
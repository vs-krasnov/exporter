import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { getTokenSizeValue, generateInitialContent, getTokenName } from "./utils";

export function xmlBreakpointOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

    var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.31?node-id=21611-43447&t=jfqgW5DlNd7Q2DOI-0") + `\n`

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
          name = name.charAt(0).toLocaleLowerCase() + name.slice(1)
          const value = getTokenSizeValue(token, tokens, tokenGroups)
          content += `    <dimen name="${name}">${value}dp</dimen>\n`;
        }
      })

    content += `</resources>\n`;

    return [FileHelper.createTextFile({
        relativePath: exportConfiguration.baseStyleFilePath + "/values",
        fileName: exportConfiguration.styleFileNames[type],
        content: content,
      })]
}
import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { generateInitialContent } from "./utils";
import { TypographyToken } from "@supernovaio/sdk-exporters";

const TYPO_PREFIX = "Typo"
const TYPO_BASE_SUFFIX = "Base"
const TYPO_BOLD = `<item name="android:textStyle">bold</item>`

function getTypoPath(typo: Token): string {
  const path = typo.origin?.name?.split('/')[0];
  return path ? path.charAt(0).toLocaleUpperCase() + path.slice(1) : "";
}

function getTypoName(typo: Token): string {
  return typo.origin?.name?.split('/')[1]
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('.') || "";
}

function generateTypographyToken(token: Token): String {
  var content = ''
  content += `    <style name="${TYPO_PREFIX}.${getTypoPath(token)}.${getTypoName(token)}" parent="${TYPO_PREFIX}.${getTypoPath(token)}.${TYPO_BASE_SUFFIX}">
        <item name="android:textSize">${(token as TypographyToken).value.fontSize.measure}sp</item>
        <item name="fontWeight">${(token as TypographyToken).value.fontWeight.text}</item>
        <item name="lineHeight">${(token as TypographyToken).value.lineHeight?.measure}sp</item>`
  if ((getTypoName(token)).toLowerCase().includes('bold')) {
    content += `\n        ${TYPO_BOLD}`
  }
  content += `\n    </style>\n\n`
  return content
}

export function xmlTypographyOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

  var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.32?node-id=36756-117727") + `\n`

  tokens.forEach(token => {
    content += generateTypographyToken(token)
  })

  content += `</resources>\n`;

  return [FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath + "/values",
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  })]
}
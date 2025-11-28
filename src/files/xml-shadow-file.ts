import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, ShadowToken, ShadowTokenValue, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { generateInitialContent, getTokenName, colorTokenToAndroidHex, Theme } from "./utils";
import { NamingHelper } from "@supernovaio/export-helpers"

function generateBlurRadius(tokenName: string, value: number): string {
  return `    <dimen name="${tokenName}BlurRadius">${value}dp</dimen>\n`
}

function generateSpreadRadius(tokenName: string, value: number): string {
  return `    <dimen name="${tokenName}SpreadRadius">${value}dp</dimen>\n`
}

function generateXOffset(tokenName: string, value: number): string {
  return `    <dimen name="${tokenName}XOffset">${value}dp</dimen>\n`
}

function generateYOffset(tokenName: string, value: number): string {
  return `    <dimen name="${tokenName}YOffset">${value}dp</dimen>\n`
}

function generateColor(tokenName: string, value: string): string {
  return `    <color name="${tokenName}Color">${value}</color>\n`
}

export function xmlShadowOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

  var content = generateInitialContent("https://www.figma.com/design/JjaALcWYWcqGtanufVLKYj/Pixar%3A-UI-v1.32?node-id=21611-42446") + `\n`

  tokens.filter((token) => {
    const prefix = exportConfiguration.tokenPrefixes[token.tokenType]
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!!
    const name = NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
    return name.includes(Theme.LIGHTMODE)
  }).forEach(token => {
    let tokenName = getTokenName(token, tokenGroups)
    let tokenValue = ((token as ShadowToken).shadowLayers[0].value[0] as ShadowTokenValue)
    content += generateBlurRadius(tokenName, tokenValue.radius)
    content += generateSpreadRadius(tokenName, tokenValue.spread)
    content += generateXOffset(tokenName, tokenValue.x)
    content += generateYOffset(tokenName, tokenValue.y)
    content += generateColor(tokenName, colorTokenToAndroidHex(tokenValue.color.color, tokenValue.opacity.measure))
    content += `\n`
  })

  content += `</resources>\n`;

  return [FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath + "/values",
    fileName: exportConfiguration.styleFileNames[type],
    content: content,
  })]
}
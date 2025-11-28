import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { xmlColorsOutputFile } from "./xml-colors-file"
import { xmlGradientsOutputFile } from "./xml-gradients-file"
import { xmlSizeOutputFile } from "./xml-size-file"
import { xmlSpacingOutputFile } from "./xml-spacing-file"
import { xmlBorderOutputFile } from "./xml-border-file"
import { xmlRadiusOutputFile } from "./xml-radius-file"
import { xmlBreakpointOutputFile } from "./xml-breakpoint-file"
import { getTokenName } from "./utils"
import { xmlTypographyOutputFile } from "./xml-typography-file"
import { xmlShadowOutputFile } from "./xml-shadow-file"

export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Array<OutputTextFile> | null {

  switch (type) {
    case TokenType.color: {
      return xmlColorsOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.gradient: {
      return xmlGradientsOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.size: {
      return xmlSizeOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.space: {
      return xmlSpacingOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.borderWidth: {
      return xmlBorderOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.radius: {
      return xmlRadiusOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.productCopy: {
      let breakpointTokens = tokens
        .filter(token => token.tokenType === type)
        .filter(token => {
          if (token != null)
            return !getTokenName(token, tokenGroups).toLocaleLowerCase().includes("border")
        })
      return xmlBreakpointOutputFile(type, breakpointTokens, tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.typography: {
      return xmlTypographyOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }
    case TokenType.shadow: {
      return xmlShadowOutputFile(type, tokens.filter(token => token.tokenType === type), tokenGroups.filter(token => token.tokenType === type))
    }

    default: return null
  }

}

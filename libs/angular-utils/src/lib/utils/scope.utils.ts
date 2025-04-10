import { AppStateService } from '@onecx/angular-integration-interface'
import { RemoteComponentConfig } from '@onecx/angular-remote-components'
import { ReplaySubject, firstValueFrom, map } from 'rxjs'

const everythingNotACharacterOrNumberRegex = /[^a-zA-Z0-9-]/g
export const dataStyleIdKey = 'styleId'
export const dataStyleIsolationKey = 'styleIsolation'
export const dataNoPortalLayoutStylesKey = 'noPortalLayoutStyles'
export const dataIntermediateStyleIdKey = 'intermediateStyleId'
export const dataIntermediateStyleIsolationKey = 'intermediateStyleIsolation'
export const dataIntermediateNoPortalLayoutStylesKey = 'intermediateNoPortalLayoutStyles'
export const dataVariableOverrideIdKey = 'VariableOverrideId'
export const dataStyleIdAttribute = 'data-style-id'
export const dataStyleIsolationAttribute = 'data-style-isolation'
export const dataNoPortalLayoutStylesAttribute = 'data-no-portal-layout-styles'
export const dataIntermediateStyleIdAttribute = 'data-intermediate-style-id'
export const dataIntermediateStyleIsolationAttribute = 'data-intermediate-style-ssolation'
export const dataIntermediateNoPortalLayoutStylesAttribute = 'data-intermediate-no-portal-layout-styles'
export const dataVariableOverrideIdAttibute = 'data-variable-override-id'

export const portalLayoutStylesSheetId = `[${dataStyleIdAttribute}]:not([${dataNoPortalLayoutStylesAttribute}])`
export const dynamicPortalLayoutStylesSheetId = `body>:not([${dataNoPortalLayoutStylesAttribute}])`

// Style scoping should be skipped for Shell
// For Remote Components application data from config is taken
// For MFE data from currentMfe topic is taken
export async function getScopeIdentifier(
  appStateService: AppStateService,
  skipStyleScoping?: boolean,
  remoteComponentConfig?: ReplaySubject<RemoteComponentConfig>
) {
  let scopeId = ''
  if (!skipStyleScoping) {
    if (remoteComponentConfig) {
      const rcConfig = await firstValueFrom(remoteComponentConfig)
      scopeId = `${rcConfig.productName}|${rcConfig.appId}`
    } else {
      scopeId = await firstValueFrom(
        appStateService.currentMfe$.pipe(map((mfeInfo) => `${mfeInfo.productName}|${mfeInfo.appId}`))
      )
    }
  }
  return scopeId
}

export function scopeStyle(css: string, scopeId: string) {
  const isScopeSupported = typeof CSSScopeRule !== 'undefined'
  if (scopeId === '') {
    return isScopeSupported
      ? `
    @scope([${dataStyleIdAttribute}="shell-ui"]) to ([${dataStyleIsolationAttribute}]) {
            ${css}
        }
    `
      : `
    @supports (@scope([${dataStyleIdAttribute}="shell-ui"]) to ([${dataStyleIsolationAttribute}])) {
            ${css}
        }
    `
  } else {
    return isScopeSupported
      ? `
    @scope([${dataStyleIdAttribute}="${scopeId}"][${dataNoPortalLayoutStylesAttribute}]) to ([${dataStyleIsolationAttribute}]) {
            ${css}
        }
    `
      : `
    @supports (@scope([${dataStyleIdAttribute}="${scopeId}"][${dataNoPortalLayoutStylesAttribute}]) to ([${dataStyleIsolationAttribute}])) {
            ${css}
        }
    `
  }
}

export function replacePrefix(css: string, scopeId: string) {
  if (scopeId === '') {
    return css
  }

  return css.replaceAll('--p-', scopeIdentifierToVariablePrefix(scopeId))
}

export function scopeIdentifierToVariablePrefix(scopeId: string) {
  return '--' + scopeId.replace(everythingNotACharacterOrNumberRegex, '-') + '-'
}

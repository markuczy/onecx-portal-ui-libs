import {
  AppStateService,
  CONFIG_KEY,
  ConfigurationService,
  ThemeService,
  UserService,
} from '@onecx/angular-integration-interface'
import { MfeInfo, Theme } from '@onecx/integration-interface'
import { firstValueFrom, from, map, mergeMap } from 'rxjs'
import { PortalApiService } from '../../services/portal-api.service'
import { UserProfileAPIService } from '../../services/userprofile-api.service'
import { HttpClient } from '@angular/common/http'

const CONFIG_INIT_ERR = 'CONFIG_INIT_ERR'
const USER_INIT_ERR = 'USER_INIT_ERR'
const THEME_INIT_ERR = 'THEME_INIT_ERR'
const PORTAL_LOAD_INIT_ERR = 'PORTAL_LOAD_INIT_ERR'

async function apply(themeService: ThemeService, theme: Theme): Promise<void> {
  console.log(`🎨 Applying theme: ${theme.name}`)
  await themeService.currentTheme$.publish(theme)
  if (theme.properties) {
    Object.values(theme.properties).forEach((group) => {
      for (const [key, value] of Object.entries(group)) {
        document.documentElement.style.setProperty(`--${key}`, value)
      }
    })
  }
}

function loadAndApplyTheme(themeService: ThemeService, http: HttpClient, themeName: string) {
  return http.get<Theme>(`./portal-api/internal/themes/${encodeURI(themeName)}`).pipe(
    mergeMap((theme) => {
      return from(apply(themeService, theme)).pipe(map(() => theme))
    })
  )
}

/**
 * This initializer only runs in standalone mode of the apps and not in portal-mf-shell
 */
export function standaloneInitializer(
  config: ConfigurationService,
  portalApi: PortalApiService,
  themeService: ThemeService,
  appName: string,
  appStateService: AppStateService,
  userService: UserService,
  userProfileAPIService: UserProfileAPIService,
  http: HttpClient
): () => Promise<any> {
  // eslint-disable-next-line no-restricted-syntax
  console.time('initializer')
  console.log(`⭐ Standalone initializer for: `, appName)
  let errCause: string

  return async () => {
    try {
      let configOk = false
      try {
        configOk = await config.init()
        await config.isInitialized
      } catch (e) {
        errCause = CONFIG_INIT_ERR
        throw e
      }
      console.log(`📑 config OK? ${configOk}`)

      await appStateService.isAuthenticated$.isInitialized

      try {
        const profile = await firstValueFrom(userProfileAPIService.getCurrentUser())
        await userService.profile$.publish(profile)
      } catch (e) {
        errCause = USER_INIT_ERR
        throw e
      }
      console.log('📑 user initialized')
      let portal = undefined
      try {
        portal = await firstValueFrom(portalApi.getPortalData(config.getProperty(CONFIG_KEY.TKIT_PORTAL_ID) || 'ADMIN'))
      } catch (e) {
        errCause = PORTAL_LOAD_INIT_ERR
        throw e
      }
      console.log(`📃 portal OK? `, portal)
      await appStateService.currentWorkspace$.publish({
        ...portal,
        workspaceName: portal.portalName,
      })

      const standaloneMfeInfo: MfeInfo = {
        mountPath: '/',
        remoteBaseUrl: '.',
        baseHref: '/',
        shellName: 'standalone',
        appId: '',
        productName: '',
        remoteName: '',
        elementName: '',
      }
      await appStateService.globalLoading$.publish(true)
      await appStateService.currentMfe$.publish(standaloneMfeInfo)
      await appStateService.globalLoading$.publish(false)

      let theme = undefined
      if (!portal) {
        throw new Error('No portal data found')
      } else {
        try {
          if (portal.themeName) {
            theme = await firstValueFrom(loadAndApplyTheme(themeService, http, portal.themeName))
          }
        } catch (e) {
          errCause = THEME_INIT_ERR
          throw e
        }
      }
      return theme
    } catch (e) {
      console.log('Standalone Initializer')
      console.log(`🛑 Error during initialization: ${errCause} ${e} `)
      console.dir(e)
      await appStateService.globalError$.publish(errCause || 'INITIALIZATION_ERROR')
      return undefined
    } finally {
      // eslint-disable-next-line no-restricted-syntax
      console.timeEnd('initializer')
    }
  }
}

import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { Router } from '@angular/router'
import { AppStateService, CONFIG_KEY, ConfigurationService, ThemeService } from '@onecx/angular-integration-interface'
import { MenuItem } from 'primeng/api'
import { Observable, combineLatest, concat, map, of, withLatestFrom } from 'rxjs'
import { API_PREFIX } from '../../../api/constants'
import { MenuService } from '../../../services/app.menu.service'
import { ImageLogoUrlUtils } from '../../utils/image-logo-url.utils'
@Component({
  standalone: false,
  selector: 'ocx-footer',
  templateUrl: './portal-footer.component.html',
  styleUrls: ['./portal-footer.component.scss'],
})
export class PortalFooterComponent implements OnInit {
  private configurationService = inject(ConfigurationService)
  router = inject(Router)
  private appState = inject(AppStateService)
  private menuService = inject(MenuService)
  private themeService = inject(ThemeService)
  private ref = inject(ChangeDetectorRef)

  copyrightMsg$: Observable<string> | undefined
  logoUrl$: Observable<string | undefined>
  currentYear = new Date().getFullYear()
  portalMenuItems: MenuItem[] = []
  versionInfo$: Observable<string | undefined>
  apiPrefix: string = API_PREFIX

  constructor() {
    this.versionInfo$ = this.appState.currentMfe$.pipe(
      withLatestFrom(this.appState.currentWorkspace$.asObservable()),
      map(([mfe, workspace]) => {
        const mfeInfoVersion = mfe?.version || ''
        const mfeName = mfe?.displayName
        const hostVersion = this.configurationService.getProperty(CONFIG_KEY.APP_VERSION) || 'DEV-LOCAL'
        const mfInfoText = mfeName ? `MF ${mfeName} v${mfeInfoVersion}` : ''
        return `Portal: ${workspace.workspaceName} v${hostVersion} ${mfInfoText}`
      })
    )
    this.logoUrl$ = combineLatest([
      this.themeService.currentTheme$.asObservable(),
      this.appState.currentWorkspace$.asObservable(),
    ]).pipe(
      map(([theme, workspaceData]) =>
        ImageLogoUrlUtils.createLogoUrl(API_PREFIX, theme.logoUrl || workspaceData.logoUrl)
      )
    )
  }
  ngOnInit(): void {
    this.copyrightMsg$ = concat(
      of('All rights reserved.'),
      this.appState.currentWorkspace$.pipe(
        map((workspaceData) => {
          if (
            !(
              workspaceData.footerLabel === '' ||
              workspaceData.footerLabel === 'string' ||
              workspaceData.footerLabel === undefined
            )
          ) {
            return workspaceData.companyName || workspaceData.footerLabel || 'All rights reserved.'
          }
          return ''
        })
      )
    )

    this.menuService
      .getMenuItems()
      .subscribe((el) =>
        el.find((item) => (item.id === 'PORTAL_FOOTER_MENU' ? this.createMenu(item as MenuItem) : null))
      )
  }
  public onErrorHandleSrc(): void {
    this.logoUrl$ = of(undefined)
  }
  private createMenu(menuItem: MenuItem): void {
    if (menuItem && menuItem.items) {
      this.portalMenuItems = menuItem.items
        .sort((a: any, b: any) => a.position - b.position)
        .filter((m: any, i) => {
          if (i < 4) return m // max 4 entries in footer
        })
        .map((item: MenuItem) => {
          return item
        })
      this.ref.detectChanges()
    } else {
      this.portalMenuItems = []
    }
  }

  private setImageUrl(url?: string): string | undefined {
    //if the url is from the backend, then we insert the apiPrefix
    if (url && !url.match(/^(http|https)/g)) {
      return this.apiPrefix + url
    } else {
      return url
    }
  }
}

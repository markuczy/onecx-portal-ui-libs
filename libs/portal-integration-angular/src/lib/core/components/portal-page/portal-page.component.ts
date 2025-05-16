import { Component, Input, OnInit, inject } from '@angular/core'
import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { HAS_PERMISSION_CHECKER, HasPermissionChecker } from '@onecx/angular-utils'
import { from, Observable, shareReplay } from 'rxjs'

@Component({
  standalone: false,
  selector: 'ocx-portal-page',
  templateUrl: './portal-page.component.html',
  styleUrls: ['./portal-page.component.scss'],
})
export class PortalPageComponent implements OnInit {
  private appState = inject(AppStateService)
  private userService = inject(UserService)
  private hasPermissionChecker = inject<HasPermissionChecker>(HAS_PERMISSION_CHECKER, { optional: true })

  @Input() permission = ''
  @Input() helpArticleId = ''
  @Input() pageName = ''
  @Input() applicationId = ''

  collapsed = false
  cachedHasPermissionChecker$: Observable<boolean> | undefined
  cachedUserService$: Observable<boolean> | undefined

  hasAccess(): Observable<boolean> {
    if (this.cachedHasPermissionChecker$) {
      return this.cachedHasPermissionChecker$
    }

    if (this.cachedUserService$) {
      return this.cachedUserService$
    }

    if (this.hasPermissionChecker) {
      const hasPermissionChecker$ = this.permission
        ? from(this.hasPermissionChecker.hasPermission(this.permission))
        : from(Promise.resolve(true))

      this.cachedHasPermissionChecker$ = hasPermissionChecker$.pipe(shareReplay(1))

      return this.cachedHasPermissionChecker$
    }

    const userServiceHasPermission$ = this.permission
      ? from(this.userService.hasPermission(this.permission))
      : from(Promise.resolve(true))
    this.cachedUserService$ = userServiceHasPermission$.pipe(shareReplay(1))

    return this.cachedUserService$
  }

  ngOnInit(): void {
    if (!this.helpArticleId) {
      console.warn(
        `ocx-portal-page on url ${location.pathname} does not have 'helpArticleId' set. Set to some unique string in order to support help management feature.`
      )
    }
    this.appState.currentPage$.publish({
      path: document.location.pathname,
      helpArticleId: this.helpArticleId,
      permission: this.permission,
      pageName: this.pageName,
      applicationId: this.applicationId,
    })
  }
}

import { Directive, ElementRef, Input, OnInit, Renderer2, TemplateRef, ViewContainerRef, inject } from '@angular/core'
import { UserService } from '@onecx/angular-integration-interface'
import { HAS_PERMISSION_CHECKER, HasPermissionChecker } from '@onecx/angular-utils'

@Directive({ selector: '[ocxIfPermission], [ocxIfNotPermission]', standalone: false })
export class IfPermissionDirective implements OnInit {
  private renderer = inject(Renderer2)
  private el = inject(ElementRef)
  private viewContainer = inject(ViewContainerRef)
  private hasPermissionChecker = inject<HasPermissionChecker>(HAS_PERMISSION_CHECKER, { optional: true })
  private templateRef = inject<TemplateRef<any>>(TemplateRef, { optional: true })
  private userService = inject(UserService, { optional: true })

  @Input('ocxIfPermission') permission: string | string[] | undefined
  @Input('ocxIfNotPermission') set notPermission(value: string | string[] | undefined) {
    this.permission = value
    this.negate = true
  }

  @Input() onMissingPermission: 'hide' | 'disable' = 'hide'

  @Input() ocxIfPermissionPermissions: string[] | undefined
  @Input()
  set ocxIfNotPermissionPermissions(value: string[] | undefined) {
    this.ocxIfPermissionPermissions = value
  }

  @Input()
  ocxIfPermissionElseTemplate: TemplateRef<any> | undefined
  @Input()
  set ocxIfNotPermissionElseTemplate(value: TemplateRef<any> | undefined) {
    this.ocxIfPermissionElseTemplate = value
  }

  private permissionChecker: HasPermissionChecker | undefined | null
  negate = false

  constructor() {
    const hasPermissionChecker = this.hasPermissionChecker
    const userService = this.userService

    if (!(hasPermissionChecker || userService)) {
      throw 'IfPermission requires UserService or HasPermissionChecker to be provided!'
    }

    this.permissionChecker = hasPermissionChecker ?? userService
  }

  ngOnInit() {
    if (
      (this.permission &&
        this.negate === this.hasPermission(Array.isArray(this.permission) ? this.permission : [this.permission])) ||
      !this.permission
    ) {
      if (this.ocxIfPermissionElseTemplate) {
        this.viewContainer.createEmbeddedView(this.ocxIfPermissionElseTemplate)
      } else {
        if (this.onMissingPermission === 'disable') {
          this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'disabled')
        } else {
          this.viewContainer.clear()
        }
      }
    } else {
      if (this.templateRef) {
        this.viewContainer.createEmbeddedView(this.templateRef)
      }
    }
  }

  hasPermission(permission: string[]) {
    if (this.ocxIfPermissionPermissions) {
      const result = permission.every((p) => this.ocxIfPermissionPermissions?.includes(p))
      if (!result) {
        console.log('👮‍♀️ No permission in overwrites for: `', permission)
      }
      return result
    }
    return permission.every((p) => this.permissionChecker?.hasPermission(p))
  }
}

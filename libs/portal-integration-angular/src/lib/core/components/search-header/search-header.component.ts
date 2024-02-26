import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { Action } from '../page-header/page-header.component'
import { SearchConfig } from '../../../model/search-config'

/**
 * To trigger the search when Enter key is pressed inside a search parameter field,
 * an EventListener for keyup enter event is added for HTML elements which have an input.
 * Please add the EventListener yourself manually, if you want to have that functionality for some other elements
 * which do not have an input element.
 */
@Component({
  selector: 'ocx-search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
})
export class SearchHeaderComponent implements AfterViewInit {
  @Input() searchConfigsEntries: SearchConfig[] | undefined
  @Input() headline = ''
  @Input() manualBreadcrumbs = false
  _actions: Action[] = []
  @Input()
  get actions() {
    return this._actions
  }
  set actions(value) {
    this._actions = value
    this.updateHeaderActions()
  }

  @Output() searched: EventEmitter<any> = new EventEmitter()
  @Output() resetted: EventEmitter<any> = new EventEmitter()
  @Output() selectedSearchConfig: EventEmitter<any> = new EventEmitter()
  @ContentChild('additionalToolbarContent')
  additionalToolbarContent: TemplateRef<any> | undefined

  get _additionalToolbarContent(): TemplateRef<any> | undefined {
    return this.additionalToolbarContent
  }

  @ViewChild('searchParameterFields') searchParameterFields: ElementRef | undefined

  viewMode: 'simple' | 'advanced' = 'simple'
  hasAdvanced = false
  headerActions: Action[] = []

  ngAfterViewInit(): void {
    this.addKeyUpEventListener()
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'simple' ? 'advanced' : 'simple'
    this.updateHeaderActions()
    setTimeout(() => this.addKeyUpEventListener())
  }

  onResetClicked() {
    this.resetted.emit()
  }

  onSearchClicked() {
    this.searched.emit()
  }

  updateHeaderActions() {
    const headerActions: Action[] = []
    if (this.hasAdvanced) {
      headerActions.push({
        id: 'simpleAdvancedButton',
        labelKey:
          this.viewMode === 'simple'
            ? 'OCX_SEARCH_HEADER.TOGGLE_BUTTON.ADVANCED.TEXT'
            : 'OCX_SEARCH_HEADER.TOGGLE_BUTTON.SIMPLE.TEXT',
        actionCallback: () => this.toggleViewMode(),
        show: 'always',
        ariaLabel:
          this.viewMode === 'simple'
            ? 'OCX_SEARCH_HEADER.TOGGLE_BUTTON.ADVANCED.ARIA_LABEL'
            : 'OCX_SEARCH_HEADER.TOGGLE_BUTTON.SIMPLE.ARIA_LABEL',
      })
    }
    this.headerActions = headerActions.concat(this.actions)
  }

  addKeyUpEventListener() {
    const inputElements = this.searchParameterFields?.nativeElement.querySelectorAll('input')
    inputElements.forEach((inputElement: any) => {
      if (!inputElement.listenerAdded) {
        inputElement.addEventListener('keyup', (event: any) => this.onSearchKeyup(event))
        inputElement.listenerAdded = true
      }
    })
  }

  onSearchKeyup(event: any) {
    if (event.code === 'Enter') {
      this.onSearchClicked()
    }
  }

  confirmSearchConfig(event: any) {
    this.selectedSearchConfig?.emit(event)
  }
}

import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateModule } from '@ngx-translate/core'
import { PrimeNgModule } from './primeng.module'
import { ColumnGroupSelectionComponent } from './components/column-group-selection/column-group-selection.component'
import { CustomGroupColumnSelectorComponent } from './components/custom-group-column-selector/custom-group-column-selector.component'
import { DataLayoutSelectionComponent } from './components/data-layout-selection/data-layout-selection.component'
import { DataListGridSortingComponent } from './components/data-list-grid-sorting/data-list-grid-sorting.component'
import { DataListGridComponent } from './components/data-list-grid/data-list-grid.component'
import { DataTableComponent } from './components/data-table/data-table.component'
import { DataViewComponent } from './components/data-view/data-view.component'
import { InteractiveDataViewComponent } from './components/interactive-data-view/interactive-data-view.component'
import { SearchConfigComponent } from './components/search-config/search-config.component'
import { PageHeaderComponent } from './components/page-header/page-header.component'
import { SearchHeaderComponent } from './components/search-header/search-header.component'
import { GroupByCountDiagramComponent } from './components/group-by-count-diagram/group-by-count-diagram.component'
import { DiagramComponent } from './components/diagram/diagram.component'
import { UserService } from '../services/user.service'
import { DynamicPipe } from './pipes/dynamic.pipe'
import { RelativeDatePipe } from './pipes/relative-date.pipe'
import { IfPermissionDirective } from './directives/if-permission.directive'

export class AngularAcceleratorMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    console.log(`Missing translation for ${params.key}`, params)
    return params.key
  }
}

@NgModule({
  imports: [CommonModule, PrimeNgModule, TranslateModule.forRoot(), FormsModule, RouterModule, ReactiveFormsModule],
  declarations: [
    ColumnGroupSelectionComponent,
    CustomGroupColumnSelectorComponent,
    DataLayoutSelectionComponent,
    DataListGridSortingComponent,
    DataListGridComponent,
    DataTableComponent,
    RelativeDatePipe,
    DataViewComponent,
    InteractiveDataViewComponent,
    SearchConfigComponent,
    PageHeaderComponent,
    DynamicPipe,
    SearchHeaderComponent,
    DiagramComponent,
    GroupByCountDiagramComponent,
    IfPermissionDirective,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: (UserService: UserService) => {
        return UserService.lang$.getValue()
      },
      deps: [UserService],
    },
  ],
  exports: [
    ColumnGroupSelectionComponent,
    CustomGroupColumnSelectorComponent,
    DataLayoutSelectionComponent,
    DataListGridComponent,
    DataTableComponent,
    RelativeDatePipe,
    DataViewComponent,
    InteractiveDataViewComponent,
    SearchConfigComponent,
    PageHeaderComponent,
    SearchHeaderComponent,
    DiagramComponent,
    GroupByCountDiagramComponent,
    IfPermissionDirective,
    // DataListGridSortingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AngularAcceleratorModule {}

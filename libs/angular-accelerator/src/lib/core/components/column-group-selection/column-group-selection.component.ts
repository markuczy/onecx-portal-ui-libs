import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs'
import { DataTableColumn } from '../../../model/data-table-column.model'

export type GroupSelectionChangedEvent = { activeColumns: DataTableColumn[]; groupKey: string }
@Component({
  templateUrl: './column-group-selection.component.html',
  selector: 'ocx-column-group-selection',
  styleUrls: ['./column-group-selection.component.scss'],
})
export class ColumnGroupSelectionComponent implements OnInit {
  selectedGroupKey$ = new BehaviorSubject<string>('')
  @Input()
  get selectedGroupKey(): string {
    return this.selectedGroupKey$.getValue()
  }
  set selectedGroupKey(value: string) {
    this.selectedGroupKey$.next(value)
  }

  columns$ = new BehaviorSubject<DataTableColumn[]>([])
  @Input()
  get columns(): DataTableColumn[] {
    return this.columns$.getValue()
  }
  set columns(value: DataTableColumn[]) {
    this.columns$.next(value)
  }
  @Input() placeholderKey = ''
  @Input() defaultGroupKey = ''
  @Input() customGroupKey = ''

  @Output() groupSelectionChanged: EventEmitter<GroupSelectionChangedEvent> = new EventEmitter()

  allGroupKeys$: Observable<string[]> | undefined

  ngOnInit() {
    this.allGroupKeys$ = combineLatest([this.columns$, this.selectedGroupKey$]).pipe(
      map(([columns, selectedGroupKey]) =>
        columns
          .map((keys) => keys.predefinedGroupKeys || [])
          .flat()
          .concat([this.defaultGroupKey])
          .concat([selectedGroupKey])
          .filter((value) => !!value)
          .filter((value, index, self) => self.indexOf(value) === index && value != null)
      )
    )
  }

  changeGroupSelection(event: { value: string }) {
    if (event.value === this.customGroupKey) {
      return
    }
    const activeColumns = this.columns.filter((c) => c.predefinedGroupKeys?.includes(event.value))
    this.groupSelectionChanged.emit({ activeColumns, groupKey: event.value })
  }

  clearGroupSelection() {
    let activeColumns = this.columns
    if (this.defaultGroupKey) {
      activeColumns = this.columns.filter((column) => column.predefinedGroupKeys?.includes(this.defaultGroupKey))
    }
    this.groupSelectionChanged.emit({ activeColumns, groupKey: this.defaultGroupKey })
  }
}

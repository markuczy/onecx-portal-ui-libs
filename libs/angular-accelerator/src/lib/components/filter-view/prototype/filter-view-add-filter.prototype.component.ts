// ============================================================================
// PROTOTYPE — throwaway code, do not build on top of this.
// Question being answered: "What should adding a new filter look like in
// ocx-filter-view, for both 'chips' and 'button' displayMode, without
// overflowing the interactive-data-view topbar?"
//
// Three structurally different variants, switchable via the floating bar
// at the bottom of the story (also reflected in the `pvariant` query param
// so the URL is shareable/reload-stable). Each variant renders BOTH
// displayMode rows stacked so button-mode and chips-mode can be judged
// side by side.
//
// See interactive-data-view/prototype STORY: "Prototype/FilterView Add Filter"
// ============================================================================
import { CommonModule } from '@angular/common'
import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { ChipModule } from 'primeng/chip'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { MenuModule } from 'primeng/menu'
import { MenuItem } from 'primeng/api'
import { PopoverModule, Popover } from 'primeng/popover'
import { SelectModule } from 'primeng/select'

export interface PrototypeColumn {
  id: string
  name: string
}

export interface PrototypeFilter {
  columnId: string
  value: string
}

const COLUMNS: PrototypeColumn[] = [
  { id: 'product', name: 'Product' },
  { id: 'category', name: 'Category' },
  { id: 'status', name: 'Status' },
  { id: 'price', name: 'Price' },
  { id: 'owner', name: 'Owner' },
]

const INITIAL_FILTERS: PrototypeFilter[] = [
  { columnId: 'product', value: 'Keyboard' },
  { columnId: 'category', value: 'Electronics' },
  { columnId: 'status', value: 'Active' },
]

// ----------------------------------------------------------------------------
// Shared "add filter" form state, reused by all three variants so the actual
// add/remove/reset behaviour is identical — only the surrounding chrome
// (button vs. menu vs. inline chip, popover vs. dialog) differs.
// ----------------------------------------------------------------------------
export abstract class FilterPlaygroundBase {
  readonly columns = COLUMNS
  readonly filters = signal<PrototypeFilter[]>([...INITIAL_FILTERS])

  readonly newFilterColumnId = signal<string | null>(null)
  readonly newFilterValue = signal('')

  columnName(columnId: string): string {
    return this.columns.find((c) => c.id === columnId)?.name ?? columnId
  }

  removeFilter(filter: PrototypeFilter) {
    this.filters.update((fs) => fs.filter((f) => f !== filter))
  }

  clearAll() {
    this.filters.set([])
  }

  resetForm() {
    this.newFilterColumnId.set(null)
    this.newFilterValue.set('')
  }

  submitNewFilter() {
    const columnId = this.newFilterColumnId()
    const value = this.newFilterValue().trim()
    if (!columnId || !value) return
    this.filters.update((fs) => [...fs, { columnId, value }])
    this.resetForm()
  }
}

// ============================================================================
// VARIANT A — Inline "+ Add" button that opens a Popover with a small form.
// Smallest structural change: one new button placed next to the existing
// controls (Manage Filters button, or at the end of the chip row).
// ============================================================================
@Component({
  standalone: true,
  selector: 'proto-variant-a',
  imports: [CommonModule, FormsModule, ButtonModule, ChipModule, PopoverModule, SelectModule, InputTextModule],
  template: `
    <div class="flex flex-column gap-4">
      <div>
        <div class="text-sm text-color-secondary mb-2">Button mode</div>
        <div class="flex align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-sliders-h" label="Manage Filters" [badge]="filters().length.toString()"></p-button>
          <p-button icon="pi pi-plus" label="Add Filter" (onClick)="op.toggle($event)"></p-button>
        </div>
      </div>

      <div>
        <div class="text-sm text-color-secondary mb-2">Chips mode</div>
        <div class="flex flex-wrap align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-eraser" (onClick)="clearAll()" [disabled]="filters().length === 0"></p-button>
          @for (filter of filters(); track filter) {
          <p-chip [removable]="true" (onRemove)="removeFilter(filter)">
            <span class="p-chip-text">{{ columnName(filter.columnId) }}: {{ filter.value }}</span>
          </p-chip>
          } @if (filters().length === 0) {
          <span class="text-color-secondary">No filters selected</span>
          }
          <p-button icon="pi pi-plus" label="Add Filter" styleClass="p-button-outlined" (onClick)="op.toggle($event)"></p-button>
        </div>
      </div>
    </div>

    <p-popover #op>
      <ng-template pTemplate="content">
        <div class="flex flex-column gap-3" style="width: 16rem">
          <span class="font-medium">Add filter</span>
          <p-select [options]="columns" optionLabel="name" optionValue="id" placeholder="Column" [(ngModel)]="newFilterColumnIdModel"></p-select>
          <input pInputText placeholder="Value" [(ngModel)]="newFilterValueModel" />
          <p-button label="Add" icon="pi pi-check" (onClick)="submitNewFilter(); op.hide()"></p-button>
        </div>
      </ng-template>
    </p-popover>
  `,
})
export class ProtoVariantAComponent extends FilterPlaygroundBase {
  get newFilterColumnIdModel() {
    return this.newFilterColumnId()
  }
  set newFilterColumnIdModel(v: string | null) {
    this.newFilterColumnId.set(v)
  }
  get newFilterValueModel() {
    return this.newFilterValue()
  }
  set newFilterValueModel(v: string) {
    this.newFilterValue.set(v)
  }
}

// ============================================================================
// VARIANT B — Consolidated "Filters" menu. Reset / Add / Manage all collapse
// into a single overflow menu button, so the topbar only ever grows by ONE
// control no matter how many filter-related actions exist.
// ============================================================================
@Component({
  standalone: true,
  selector: 'proto-variant-b',
  imports: [CommonModule, FormsModule, ButtonModule, ChipModule, MenuModule, DialogModule, SelectModule, InputTextModule],
  template: `
    <div class="flex flex-column gap-4">
      <div>
        <div class="text-sm text-color-secondary mb-2">Button mode</div>
        <div class="flex align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-filter" label="Filters" [badge]="filters().length.toString()" (onClick)="menu.toggle($event)"></p-button>
        </div>
      </div>

      <div>
        <div class="text-sm text-color-secondary mb-2">Chips mode</div>
        <div class="flex flex-wrap align-items-center gap-2 p-2 border-1 surface-border border-round">
          @for (filter of filters(); track filter) {
          <p-chip [removable]="true" (onRemove)="removeFilter(filter)">
            <span class="p-chip-text">{{ columnName(filter.columnId) }}: {{ filter.value }}</span>
          </p-chip>
          } @if (filters().length === 0) {
          <span class="text-color-secondary">No filters selected</span>
          }
          <p-button icon="pi pi-ellipsis-h" (onClick)="menu.toggle($event)" [ariaLabel]="'Filter actions'"></p-button>
        </div>
      </div>
    </div>

    <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>

    <p-dialog header="Add filter" [(visible)]="addDialogVisible" [modal]="true" [style]="{ width: '22rem' }">
      <div class="flex flex-column gap-3">
        <p-select [options]="columns" optionLabel="name" optionValue="id" placeholder="Column" [(ngModel)]="newFilterColumnIdModel"></p-select>
        <input pInputText placeholder="Value" [(ngModel)]="newFilterValueModel" />
        <p-button label="Add" icon="pi pi-check" (onClick)="submitNewFilter(); addDialogVisible = false"></p-button>
      </div>
    </p-dialog>
  `,
})
export class ProtoVariantBComponent extends FilterPlaygroundBase {
  addDialogVisible = false

  get menuItems(): MenuItem[] {
    return [
      { label: 'Add filter', icon: 'pi pi-plus', command: () => (this.addDialogVisible = true) },
      { label: 'Manage filters', icon: 'pi pi-sliders-h', disabled: this.filters().length === 0 },
      { label: 'Clear all', icon: 'pi pi-eraser', disabled: this.filters().length === 0, command: () => this.clearAll() },
    ]
  }

  get newFilterColumnIdModel() {
    return this.newFilterColumnId()
  }
  set newFilterColumnIdModel(v: string | null) {
    this.newFilterColumnId.set(v)
  }
  get newFilterValueModel() {
    return this.newFilterValue()
  }
  set newFilterValueModel(v: string) {
    this.newFilterValue.set(v)
  }
}

// ============================================================================
// VARIANT C — Inline "+ Add filter" pill styled like a chip, sitting inside
// the chip flow itself (and as a compact button next to Manage Filters in
// button mode) so the affordance is visually consistent across both modes.
// Opens a modal Dialog (heavier commitment than a popover) for the form.
// ============================================================================
@Component({
  standalone: true,
  selector: 'proto-variant-c',
  imports: [CommonModule, FormsModule, ButtonModule, ChipModule, DialogModule, SelectModule, InputTextModule],
  template: `
    <div class="flex flex-column gap-4">
      <div>
        <div class="text-sm text-color-secondary mb-2">Button mode</div>
        <div class="flex align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-sliders-h" label="Manage Filters" [badge]="filters().length.toString()"></p-button>
          <p-chip styleClass="cursor-pointer add-filter-pill" (click)="addDialogVisible = true">
            <span class="p-chip-text flex align-items-center gap-1"><i class="pi pi-plus"></i> Add filter</span>
          </p-chip>
        </div>
      </div>

      <div>
        <div class="text-sm text-color-secondary mb-2">Chips mode</div>
        <div class="flex flex-wrap align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-eraser" (onClick)="clearAll()" [disabled]="filters().length === 0"></p-button>
          @for (filter of filters(); track filter) {
          <p-chip [removable]="true" (onRemove)="removeFilter(filter)">
            <span class="p-chip-text">{{ columnName(filter.columnId) }}: {{ filter.value }}</span>
          </p-chip>
          }
          <p-chip styleClass="cursor-pointer add-filter-pill" (click)="addDialogVisible = true">
            <span class="p-chip-text flex align-items-center gap-1"><i class="pi pi-plus"></i> Add filter</span>
          </p-chip>
        </div>
      </div>
    </div>

    <p-dialog header="Add filter" [(visible)]="addDialogVisible" [modal]="true" [style]="{ width: '22rem' }">
      <div class="flex flex-column gap-3">
        <p-select [options]="columns" optionLabel="name" optionValue="id" placeholder="Column" [(ngModel)]="newFilterColumnIdModel"></p-select>
        <input pInputText placeholder="Value" [(ngModel)]="newFilterValueModel" />
        <p-button label="Add" icon="pi pi-check" (onClick)="submitNewFilter(); addDialogVisible = false"></p-button>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .add-filter-pill {
        border: 1px dashed var(--p-surface-400, #94a3b8);
        background: transparent;
      }
    `,
  ],
})
export class ProtoVariantCComponent extends FilterPlaygroundBase {
  addDialogVisible = false

  get newFilterColumnIdModel() {
    return this.newFilterColumnId()
  }
  set newFilterColumnIdModel(v: string | null) {
    this.newFilterColumnId.set(v)
  }
  get newFilterValueModel() {
    return this.newFilterValue()
  }
  set newFilterValueModel(v: string) {
    this.newFilterValue.set(v)
  }
}

// ============================================================================
// VARIANT D — CHOSEN COMBINATION (chips mode = C, button mode = simplified).
//
// Chips mode: identical to Variant C — a dashed "+ Add filter" pill lives
// inline in the chip flow and opens a modal Dialog with the add form.
//
// Button mode: no new top-level button is added at all. The existing
// "Manage Filters" button still opens its panel as before; that panel now
// simply gains an "Add Filter" toggle in its header, which reveals the same
// column + value form inline, directly above the existing filter list/table.
// The topbar itself never grows.
// ============================================================================
@Component({
  standalone: true,
  selector: 'proto-variant-d',
  imports: [CommonModule, FormsModule, ButtonModule, ChipModule, DialogModule, PopoverModule, SelectModule, InputTextModule],
  template: `
    <div class="flex flex-column gap-4">
      <div>
        <div class="text-sm text-color-secondary mb-2">Button mode</div>
        <div class="flex align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button
            icon="pi pi-sliders-h"
            label="Manage Filters"
            [badge]="filters().length.toString()"
            (onClick)="op.toggle($event)"
          ></p-button>
        </div>
      </div>

      <div>
        <div class="text-sm text-color-secondary mb-2">Chips mode</div>
        <div class="flex flex-wrap align-items-center gap-2 p-2 border-1 surface-border border-round">
          <p-button icon="pi pi-eraser" (onClick)="clearAll()" [disabled]="filters().length === 0"></p-button>
          @for (filter of filters(); track filter) {
          <p-chip [removable]="true" (onRemove)="removeFilter(filter)">
            <span class="p-chip-text">{{ columnName(filter.columnId) }}: {{ filter.value }}</span>
          </p-chip>
          }
          <p-chip styleClass="cursor-pointer add-filter-pill" (click)="addDialogVisible = true">
            <span class="p-chip-text flex align-items-center gap-1"><i class="pi pi-plus"></i> Add filter</span>
          </p-chip>
        </div>
      </div>
    </div>

    <!-- Button mode: existing "Manage Filters" panel, now with an in-panel Add Filter toggle -->
    <p-popover #op (onHide)="showAddForm.set(false)">
      <ng-template pTemplate="content">
        <div style="width: 20rem">
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="text-xl font-medium">Filters</span>
            <div class="flex gap-2">
              <p-button icon="pi pi-plus" label="Add Filter" styleClass="p-button-text" (onClick)="showAddForm.set(!showAddForm())"></p-button>
              <p-button icon="pi pi-eraser" (onClick)="clearAll()" [disabled]="filters().length === 0"></p-button>
            </div>
          </div>

          @if (showAddForm()) {
          <div class="flex flex-column gap-2 mb-3 p-2 surface-100 border-round">
            <p-select [options]="columns" optionLabel="name" optionValue="id" placeholder="Column" [(ngModel)]="newFilterColumnIdModel"></p-select>
            <input pInputText placeholder="Value" [(ngModel)]="newFilterValueModel" />
            <p-button label="Add" icon="pi pi-check" (onClick)="submitNewFilter(); showAddForm.set(false)"></p-button>
          </div>
          }

          @if (filters().length === 0) {
          <span class="text-color-secondary">No filters selected</span>
          } @for (filter of filters(); track filter) {
          <div class="flex justify-content-between align-items-center py-1">
            <span>{{ columnName(filter.columnId) }}: {{ filter.value }}</span>
            <p-button icon="pi pi-trash" styleClass="p-button-rounded p-button-danger p-button-text" (onClick)="removeFilter(filter)"></p-button>
          </div>
          }
        </div>
      </ng-template>
    </p-popover>

    <!-- Chips mode: same modal Dialog as Variant C -->
    <p-dialog header="Add filter" [(visible)]="addDialogVisible" [modal]="true" [style]="{ width: '22rem' }">
      <div class="flex flex-column gap-3">
        <p-select [options]="columns" optionLabel="name" optionValue="id" placeholder="Column" [(ngModel)]="newFilterColumnIdModel"></p-select>
        <input pInputText placeholder="Value" [(ngModel)]="newFilterValueModel" />
        <p-button label="Add" icon="pi pi-check" (onClick)="submitNewFilter(); addDialogVisible = false"></p-button>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .add-filter-pill {
        border: 1px dashed var(--p-surface-400, #94a3b8);
        background: transparent;
      }
    `,
  ],
})
export class ProtoVariantDComponent extends FilterPlaygroundBase {
  addDialogVisible = false
  readonly showAddForm = signal(false)

  get newFilterColumnIdModel() {
    return this.newFilterColumnId()
  }
  set newFilterColumnIdModel(v: string | null) {
    this.newFilterColumnId.set(v)
  }
  get newFilterValueModel() {
    return this.newFilterValue()
  }
  set newFilterValueModel(v: string) {
    this.newFilterValue.set(v)
  }
}

// ============================================================================
// Switcher host — floating bottom bar, arrow-key + click cycling, keeps a
// `pvariant` query param in sync so the URL stays shareable/reload-stable.
// ============================================================================
const VARIANTS = [
  { key: 'A', name: 'Inline button + popover' },
  { key: 'B', name: 'Consolidated menu' },
  { key: 'C', name: 'Inline chip-styled pill + dialog' },
  { key: 'D', name: 'CHOSEN: C chips + in-panel Add (button mode)' },
] as const

@Component({
  standalone: true,
  selector: 'proto-add-filter-switcher',
  imports: [CommonModule, ButtonModule, ProtoVariantAComponent, ProtoVariantBComponent, ProtoVariantCComponent, ProtoVariantDComponent],
  template: `
    <div class="p-4" style="padding-bottom: 5rem">
      <h3>PROTOTYPE — Add Filter affordance ({{ current().name }})</h3>
      <p class="text-color-secondary">
        Throwaway variants for ocx-filter-view. Not production code. Use the floating bar below (or ← / →) to switch.
      </p>

      @switch (variant()) { @case ('A') {
      <proto-variant-a></proto-variant-a>
      } @case ('B') {
      <proto-variant-b></proto-variant-b>
      } @case ('C') {
      <proto-variant-c></proto-variant-c>
      } @case ('D') {
      <proto-variant-d></proto-variant-d>
      } }
    </div>

    <div
      class="flex align-items-center gap-3 shadow-4 border-round-3xl"
      style="position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 0.5rem 1rem; z-index: 1000"
    >
      <p-button icon="pi pi-chevron-left" [text]="true" severity="contrast" (onClick)="prev()"></p-button>
      <span style="min-width: 14rem; text-align: center">{{ variant() }} — {{ current().name }}</span>
      <p-button icon="pi pi-chevron-right" [text]="true" severity="contrast" (onClick)="next()"></p-button>
    </div>
  `,
})
export class ProtoAddFilterSwitcherComponent {
  private readonly index = signal(this.initialIndex())
  readonly variant = computed(() => VARIANTS[this.index()].key)
  readonly current = computed(() => VARIANTS[this.index()])

  private initialIndex(): number {
    const param = new URLSearchParams(window.location.search).get('pvariant')
    const idx = VARIANTS.findIndex((v) => v.key === param)
    return idx >= 0 ? idx : 0
  }

  private syncUrl() {
    const url = new URL(window.location.href)
    url.searchParams.set('pvariant', this.variant())
    window.history.replaceState({}, '', url)
  }

  next() {
    this.index.update((i) => (i + 1) % VARIANTS.length)
    this.syncUrl()
  }

  prev() {
    this.index.update((i) => (i - 1 + VARIANTS.length) % VARIANTS.length)
    this.syncUrl()
  }
}

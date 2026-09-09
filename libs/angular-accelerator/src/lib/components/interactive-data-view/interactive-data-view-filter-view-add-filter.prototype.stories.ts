// ============================================================================
// PROTOTYPE STORY — throwaway, do not build on top of this.
// Hosts the 3 "add filter" variants (see filter-view-add-filter.prototype.component.ts)
// against the interactive-data-view's real Storybook environment (real PrimeNG
// theme, real density) so they can be judged in context.
// ============================================================================
import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular'
import { importProvidersFrom } from '@angular/core'
import { ProtoAddFilterSwitcherComponent } from '../filter-view/prototype/filter-view-add-filter.prototype.component'
import { StorybookThemeModule } from '../../storybook-theme.module'

const PrototypeAddFilterSBConfig: Meta = {
  title: 'Prototype/FilterView Add Filter',
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(StorybookThemeModule)],
    }),
    moduleMetadata({
      imports: [ProtoAddFilterSwitcherComponent],
    }),
  ],
}

const Template: StoryFn = () => ({
  template: `<proto-add-filter-switcher></proto-add-filter-switcher>`,
})

export const AddFilterVariants = {
  render: Template,
}

export default PrototypeAddFilterSBConfig

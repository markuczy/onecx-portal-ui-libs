import * as z from 'zod'
import { bg, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarNavigationSelectorSchema } from './navigationselector'
import { CalendarPanelButtonSchema } from './panelbutton'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Header of the calendar panel schema including year/month navigation selector and panel buttons.
 */
export class CalendarPanelHeaderSchema {
  private static createStateContent(withDefaults: boolean, statePath: string) {
    const navigationSelectorSchema = withDefaults
      ? CalendarNavigationSelectorSchema.schema
      : CalendarNavigationSelectorSchema.schemaNoDefaults
    const panelButtonSchema = withDefaults ? CalendarPanelButtonSchema.schema : CalendarPanelButtonSchema.schemaNoDefaults

    return z.object({
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      color: optionalDefault(color, withDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      margin: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      gap: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.sm}}'),
      selectMonth: (navigationSelectorSchema as typeof CalendarNavigationSelectorSchema.schema).prefault({}),
      selectYear: (navigationSelectorSchema as typeof CalendarNavigationSelectorSchema.schema).prefault({}),
      navButton: (panelButtonSchema as typeof CalendarPanelButtonSchema.schema).prefault({}),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    true,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarHeaderStateContentDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    false,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarHeaderStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema

    return z.object({
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarPanelHeaderUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarPanelHeaderDefaulted',
  })
}

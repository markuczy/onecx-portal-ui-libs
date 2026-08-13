import * as z from 'zod'
import { withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarInputSchema } from './input'
import { CalendarMultiMonthDividerSchema } from './multimonthdivider'
import { CalendarPanelSchema } from './panel'
import { CalendarPanelButtonSchema } from './panelbutton'
import { CalendarSettingsSchema } from './settings'

class CalendarVariantContentSchema {
  private static createSchema(withDefaults: boolean) {
    const inputSchema = withDefaults ? CalendarInputSchema.schema : CalendarInputSchema.schemaNoDefaults
    const panelSchema = withDefaults ? CalendarPanelSchema.schema : CalendarPanelSchema.schemaNoDefaults
    const panelButtonSchema = withDefaults ? CalendarPanelButtonSchema.schema : CalendarPanelButtonSchema.schemaNoDefaults

    return z.object({
      input: (inputSchema as typeof CalendarInputSchema.schema).prefault({}),
      panel: (panelSchema as typeof CalendarPanelSchema.schema).prefault({}),
      calendarIconButton: (panelButtonSchema as typeof CalendarPanelButtonSchema.schema).prefault({}),
    })
  }

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarVariantContentDefaulted',
  })

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarVariantContentUndefaulted',
  })
}

export class CalendarSchema {
  private static readonly tokens = {
    transitionDuration: withRef(z.string()).default('{{primitives.transition.duration}}'),
  }

  static readonly schema = z
    .object({
      settings: (CalendarSettingsSchema.schema as typeof CalendarSettingsSchema.schema).optional(),
      defaultVariant: (CalendarVariantContentSchema.schema as typeof CalendarVariantContentSchema.schema).prefault({}),
      primary: (CalendarVariantContentSchema.schemaNoDefaults as typeof CalendarVariantContentSchema.schemaNoDefaults).prefault({}),
      secondary: (CalendarVariantContentSchema.schemaNoDefaults as typeof CalendarVariantContentSchema.schemaNoDefaults).prefault({}),
      tertiary: (CalendarVariantContentSchema.schemaNoDefaults as typeof CalendarVariantContentSchema.schemaNoDefaults).prefault({}),
      quaternary: (CalendarVariantContentSchema.schemaNoDefaults as typeof CalendarVariantContentSchema.schemaNoDefaults).prefault({}),
      quinary: (CalendarVariantContentSchema.schemaNoDefaults as typeof CalendarVariantContentSchema.schemaNoDefaults).prefault({}),
      multiMonthDivider: (
        CalendarMultiMonthDividerSchema.schema as typeof CalendarMultiMonthDividerSchema.schema
      ).prefault({}),
      ...this.tokens,
    })
    .register(themeSchemaRegistry, { id: 'calendar' })
}

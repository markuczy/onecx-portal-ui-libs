import * as z from 'zod'
import { bg, borderWithShadow, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarDatePanelSchema } from './datepanel'
import { CalendarFooterButtonBarSchema } from './footerbuttonbar'
import { CalendarPanelHeaderSchema } from './panelheader'
import { CalendarTimePickerSchema } from './timepicker'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Calendar panel schema including header and date panel.
 */
export class CalendarPanelSchema {
  private static createStateContent(withDefaults: boolean, statePath: string) {
    const headerSchema = withDefaults ? CalendarPanelHeaderSchema.schema : CalendarPanelHeaderSchema.schemaNoDefaults
    const datePanelSchema = withDefaults ? CalendarDatePanelSchema.schema : CalendarDatePanelSchema.schemaNoDefaults
    const timePickerSchema = withDefaults ? CalendarTimePickerSchema.schema : CalendarTimePickerSchema.schemaNoDefaults
    const footerButtonBarSchema = withDefaults
      ? CalendarFooterButtonBarSchema.schema
      : CalendarFooterButtonBarSchema.schemaNoDefaults

    return z.object({
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      color: optionalDefault(color, withDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      border: optionalDefault(borderWithShadow, withDefaults, {
        color: `{{${statePath}.defaultSeverity.border.color}}`,
        style: `{{${statePath}.defaultSeverity.border.style}}`,
        width: '{{primitives.border.width.sm}}',
        offset: '{{primitives.border.offset.none}}',
        radius: '{{primitives.border.radius.sm}}',
        shadow: '{{primitives.shadow.sm}}',
      }),
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      headerGap: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.sm}}'),
      header: (headerSchema as typeof CalendarPanelHeaderSchema.schema).prefault({}),
      datePanel: (datePanelSchema as typeof CalendarDatePanelSchema.schema).prefault({}),
      timePicker: (timePickerSchema as typeof CalendarTimePickerSchema.schema).prefault({}),
      footerButtonBar: (footerButtonBarSchema as typeof CalendarFooterButtonBarSchema.schema).prefault({}),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    true,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPanelStateContentDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    false,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPanelStateContentUndefaulted' })

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
    id: 'calendarPanelUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, { id: 'calendarPanelDefaulted' })
}

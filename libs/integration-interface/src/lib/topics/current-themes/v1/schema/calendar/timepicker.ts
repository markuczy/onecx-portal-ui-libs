import * as z from 'zod'
import { border, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarPanelButtonSchema } from './panelbutton'
import { CalendarTimeSeperatorSchema } from './timeseperator'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 *  Calendar schema for the time picker.
 */
export class CalendarTimePickerSchema {
  private static createStateContent(withDefaults: boolean, statePath: string) {
    const panelButtonSchema = withDefaults ? CalendarPanelButtonSchema.schema : CalendarPanelButtonSchema.schemaNoDefaults

    return z.object({
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      border: withDefaults
        ? border.default({
            color: `{{${statePath}.defaultSeverity.border.color}}`,
            style: `{{${statePath}.defaultSeverity.border.style}}`,
            width: '{{primitives.border.width.md}}',
            radius: '{{primitives.border.radius.md}}',
            offset: '{{primitives.border.offset.none}}',
          })
        : border.optional(),
      gap: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      buttonGap: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.xs}}'),
      margin: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      timePickerButton: (panelButtonSchema as typeof CalendarPanelButtonSchema.schema).prefault({}),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    true,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarTimePickerStateContentDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    false,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarTimePickerStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema
    const timeSeparatorSchema = withDefaults ? CalendarTimeSeperatorSchema.schema : CalendarTimeSeperatorSchema.schemaNoDefaults

    return z.object({
      timeSeparator: (timeSeparatorSchema as typeof CalendarTimeSeperatorSchema.schema).prefault({}),
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarTimePickerUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarTimePickerDefaulted',
  })
}

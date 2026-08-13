import * as z from 'zod'
import { color, font, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Calendar schema for the time separator used in the calendar time picker.
 */
export class CalendarTimeSeperatorSchema {
  private static createSchema(withDefaults: boolean) {
    return z.object({
      color: optionalDefault(
        color,
        withDefaults,
        '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}'
      ),
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.xs}}'),
      font: optionalDefault(font.pick({ family: true, size: true, weight: true }), withDefaults, {
        family: '{{primitives.font.family}}',
        size: '{{primitives.font.size}}',
        weight: '{{primitives.font.weight}}',
      }),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarTimeSeperatorUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarTimeSeperatorDefaulted',
  })
}

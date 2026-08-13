import * as z from 'zod'
import { color, font, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Calendar week day label schema.
 */
export class CalendarWeekDayLabelSchema {
  private static createSchema(withDefaults: boolean) {
    return z.object({
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.xs}}'),
      font: optionalDefault(font.pick({ weight: true, size: true }), withDefaults, {
        weight: '{{primitives.font.weight.bold}}',
        size: '{{primitives.font.size}}',
      }),
      color: optionalDefault(
        color,
        withDefaults,
        '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}'
      ),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarWeekDayLabelUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarWeekDayLabelDefaulted',
  })
}

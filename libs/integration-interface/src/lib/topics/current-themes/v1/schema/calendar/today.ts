import * as z from 'zod'
import { bg, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Calendar schema for the today cell in the calendar date panel.
 */
export class CalendarTodaySchema {
  private static createSchema(withDefaults: boolean) {
    return z.object({
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withDefaults,
        '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}'
      ),
      color: optionalDefault(
        color,
        withDefaults,
        '{{primitives.defaultVariant.defaultState.defaultSeverity.contrast}}'
      ),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarTodayUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, { id: 'calendarTodayDefaulted' })
}

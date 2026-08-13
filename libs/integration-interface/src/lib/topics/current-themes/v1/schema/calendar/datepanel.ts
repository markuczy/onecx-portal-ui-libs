import * as z from 'zod'
import { bg, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarTodaySchema } from './today'
import { CalendarViewSchema } from './view'
import { CalendarWeekDayLabelSchema } from './weekdaylabel'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Calendar date panel schema.
 */
export class CalendarDatePanelSchema {
  private static createStateContent(withDefaults: boolean, statePath: string) {
    const weekDayLabelSchema = withDefaults ? CalendarWeekDayLabelSchema.schema : CalendarWeekDayLabelSchema.schemaNoDefaults
    const dayViewSchema = CalendarViewSchema.forCellField('dateCell', withDefaults)
    const monthViewSchema = CalendarViewSchema.forCellField('monthCell', withDefaults)
    const yearViewSchema = CalendarViewSchema.forCellField('yearCell', withDefaults)
    const todaySchema = withDefaults ? CalendarTodaySchema.schema : CalendarTodaySchema.schemaNoDefaults

    return z.object({
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      color: optionalDefault(color, withDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      margin: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      weekDayLabel: (weekDayLabelSchema as typeof CalendarWeekDayLabelSchema.schema).prefault({}),
      dayView: (dayViewSchema as typeof CalendarViewSchema.schema).prefault({}),
      monthView: (monthViewSchema as typeof CalendarViewSchema.monthSchema).prefault({}),
      yearView: (yearViewSchema as typeof CalendarViewSchema.yearSchema).prefault({}),
      today: (todaySchema as typeof CalendarTodaySchema.schema).prefault({}),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    true,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarDatePanelStateContentDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    false,
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarDatePanelStateContentUndefaulted' })

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
    id: 'calendarDatePanelUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarDatePanelDefaulted',
  })
}

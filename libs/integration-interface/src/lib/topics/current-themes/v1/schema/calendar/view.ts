import * as z from 'zod'
import { withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarPickerCellSchema } from './pickercell'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

export type CalendarViewCellFieldName = 'dateCell' | 'monthCell' | 'yearCell'

/**
 * Shared schema for view containers (dayView, monthView, yearView)
 */
export class CalendarViewSchema {
  private static createStateContent(cellFieldName: CalendarViewCellFieldName, withDefaults: boolean) {
    const cellSchema = withDefaults ? CalendarPickerCellSchema.schema : CalendarPickerCellSchema.schemaNoDefaults

    return z.object({
      margin: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      [cellFieldName]: (cellSchema as typeof CalendarPickerCellSchema.schema).prefault({}),
    })
  }

  private static getStateContentSchema(cellFieldName: CalendarViewCellFieldName, withDefaults: boolean) {
    if (cellFieldName === 'dateCell') {
      return withDefaults ? this.dateStateContentSchemaDefaulted : this.dateStateContentSchemaUndefaulted
    }
    if (cellFieldName === 'monthCell') {
      return withDefaults ? this.monthStateContentSchemaDefaulted : this.monthStateContentSchemaUndefaulted
    }
    return withDefaults ? this.yearStateContentSchemaDefaulted : this.yearStateContentSchemaUndefaulted
  }

  private static createSchema(cellFieldName: CalendarViewCellFieldName, withDefaults: boolean) {
    const defaultStateSchema = this.getStateContentSchema(cellFieldName, withDefaults)
    const namedStateSchema = this.getStateContentSchema(cellFieldName, false)

    return z.object({
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (namedStateSchema as typeof namedStateSchema).prefault({}),
      focus: (namedStateSchema as typeof namedStateSchema).prefault({}),
    })
  }

  static readonly dateStateContentSchemaDefaulted = this.createStateContent('dateCell', true).register(
    themeSchemaRegistry,
    { id: 'calendarViewDateStateContentDefaulted' }
  )

  static readonly dateStateContentSchemaUndefaulted = this.createStateContent('dateCell', false).register(
    themeSchemaRegistry,
    { id: 'calendarViewDateStateContentUndefaulted' }
  )

  static readonly monthStateContentSchemaDefaulted = this.createStateContent('monthCell', true).register(
    themeSchemaRegistry,
    { id: 'calendarViewMonthStateContentDefaulted' }
  )

  static readonly monthStateContentSchemaUndefaulted = this.createStateContent('monthCell', false).register(
    themeSchemaRegistry,
    { id: 'calendarViewMonthStateContentUndefaulted' }
  )

  static readonly yearStateContentSchemaDefaulted = this.createStateContent('yearCell', true).register(
    themeSchemaRegistry,
    { id: 'calendarViewYearStateContentDefaulted' }
  )

  static readonly yearStateContentSchemaUndefaulted = this.createStateContent('yearCell', false).register(
    themeSchemaRegistry,
    { id: 'calendarViewYearStateContentUndefaulted' }
  )

  static readonly schema = this.createSchema('dateCell', true).register(themeSchemaRegistry, {
    id: 'calendarViewDateDefaulted',
  })

  static readonly schemaNoDefaults = this.createSchema('dateCell', false).register(themeSchemaRegistry, {
    id: 'calendarViewDateUndefaulted',
  })

  static readonly monthSchema = this.createSchema('monthCell', true).register(themeSchemaRegistry, {
    id: 'calendarViewMonthDefaulted',
  })

  static readonly monthSchemaNoDefaults = this.createSchema('monthCell', false).register(themeSchemaRegistry, {
    id: 'calendarViewMonthUndefaulted',
  })

  static readonly yearSchema = this.createSchema('yearCell', true).register(themeSchemaRegistry, {
    id: 'calendarViewYearDefaulted',
  })

  static readonly yearSchemaNoDefaults = this.createSchema('yearCell', false).register(themeSchemaRegistry, {
    id: 'calendarViewYearUndefaulted',
  })

  static forCellField(cellFieldName: CalendarViewCellFieldName, withDefaults: boolean) {
    if (cellFieldName === 'dateCell') {
      return withDefaults ? this.schema : this.schemaNoDefaults
    }
    if (cellFieldName === 'monthCell') {
      return withDefaults ? this.monthSchema : this.monthSchemaNoDefaults
    }
    return withDefaults ? this.yearSchema : this.yearSchemaNoDefaults
  }
}

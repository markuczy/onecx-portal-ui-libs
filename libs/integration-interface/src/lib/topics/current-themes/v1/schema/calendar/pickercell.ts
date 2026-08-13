import * as z from 'zod'
import { bg, border, color, font, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

type CalendarPickerCellStateMode = 'defaultState' | 'hover' | 'selected' | 'none'

/**
 * Shared schema for calendar picker cells (dateCell, monthCell, yearCell)
 */
export class CalendarPickerCellSchema {
  private static createStateContent(mode: CalendarPickerCellStateMode, statePath: string) {
    const withFullDefaults = mode === 'defaultState'
    const withHoverDefaults = mode === 'hover'
    const withSelectedDefaults = mode === 'selected'
    const withColorDefaults = withFullDefaults || withHoverDefaults || withSelectedDefaults

    return z.object({
      width: optionalDefault(withRef(z.string()), withFullDefaults, '2.5rem'),
      height: optionalDefault(withRef(z.string()), withFullDefaults, '2.5rem'),
      padding: optionalDefault(withRef(z.string()), withFullDefaults, '{{primitives.space.xs}}'),
      font: optionalDefault(font.pick({ weight: true, size: true }), withFullDefaults, {
        weight: '{{primitives.font.weight}}',
        size: '{{primitives.font.size}}',
      }),
      color: optionalDefault(color, withColorDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withColorDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      border: withFullDefaults
        ? border.default({
            color: `{{${statePath}.defaultSeverity.border.color}}`,
            style: `{{${statePath}.defaultSeverity.border.style}}`,
            width: '{{primitives.border.width.sm}}',
            offset: '{{primitives.border.offset.none}}',
            radius: '{{primitives.border.radius.md}}',
          })
        : withHoverDefaults || withSelectedDefaults
          ? border.default({
              color: `{{${statePath}.defaultSeverity.border.color}}`,
            })
          : border.optional(),
      inRangeBackground: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withSelectedDefaults,
        '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}'
      ),
      rangeSelectedBackground: optionalDefault(
        color,
        withSelectedDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    'defaultState',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPickerCellStateContentDefaulted' })

  static readonly defaultedHoverStateContentSchema = this.createStateContent(
    'hover',
    'primitives.area.overlay.state.hover'
  ).register(themeSchemaRegistry, { id: 'calendarPickerCellStateContentHoverDefaulted' })

  static readonly defaultedSelectedStateContentSchema = this.createStateContent(
    'selected',
    'primitives.area.overlay.state.selected'
  ).register(themeSchemaRegistry, { id: 'calendarPickerCellStateContentSelectedDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    'none',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPickerCellStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema
    const hoverSchema = withDefaults ? this.defaultedHoverStateContentSchema : this.undefaultedStateContentSchema
    const selectedSchema = withDefaults
      ? this.defaultedSelectedStateContentSchema
      : this.undefaultedStateContentSchema

    return z.object({
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (hoverSchema as typeof hoverSchema).prefault({}),
      selected: (selectedSchema as typeof selectedSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      active: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      disabled: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarPickerCellUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarPickerCellDefaulted',
  })
}

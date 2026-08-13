import * as z from 'zod'
import { bg, border, borderWithShadow, color, font, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

type CalendarNavigationSelectorStateMode = 'defaultState' | 'hover' | 'none'

/**
 * Navigation selector buttons in the calendar header panel (e.g. selectMonth, selectYear) schema.
 */
export class CalendarNavigationSelectorSchema {
  private static createStateContent(mode: CalendarNavigationSelectorStateMode, statePath: string) {
    const withFullDefaults = mode === 'defaultState'
    const withHoverDefaults = mode === 'hover'
    const withColorDefaults = withFullDefaults || withHoverDefaults

    return z.object({
      padding: optionalDefault(withRef(z.string()), withFullDefaults, '{{primitives.space.sm}}'),
      font: optionalDefault(font.pick({ weight: true, size: true }), withFullDefaults, {
        weight: '{{primitives.font.weight}}',
        size: '{{primitives.font.size}}',
      }),
      border: withFullDefaults
        ? border.default({
            color: `{{${statePath}.defaultSeverity.border.color}}`,
            style: `{{${statePath}.defaultSeverity.border.style}}`,
            width: '{{primitives.border.width.none}}',
            offset: '{{primitives.border.offset.none}}',
            radius: '{{primitives.border.radius.md}}',
          })
        : border.optional(),
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withColorDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      color: optionalDefault(color, withColorDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    'defaultState',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarNavigationSelectorStateContentDefaulted' })

  static readonly defaultedHoverStateContentSchema = this.createStateContent(
    'hover',
    'primitives.area.overlay.state.hover'
  ).register(themeSchemaRegistry, { id: 'calendarNavigationSelectorStateContentHoverDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    'none',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarNavigationSelectorStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema
    const hoverSchema = withDefaults ? this.defaultedHoverStateContentSchema : this.undefaultedStateContentSchema

    return z.object({
      focusRing: optionalDefault(borderWithShadow, withDefaults, {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      }),
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (hoverSchema as typeof hoverSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarNavigationSelectorUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarNavigationSelectorDefaulted',
  })
}

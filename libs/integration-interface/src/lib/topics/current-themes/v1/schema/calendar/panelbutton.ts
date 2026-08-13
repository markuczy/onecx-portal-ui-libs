import * as z from 'zod'
import { bg, border, borderWithShadow, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

type CalendarPanelButtonStateMode = 'defaultState' | 'hover' | 'none'

/**
 * Panel buttons in the calendar panel (e.g. navigation buttons in panel header) schema.
 */
export class CalendarPanelButtonSchema {
  private static createStateContent(mode: CalendarPanelButtonStateMode, statePath: string) {
    const withFullDefaults = mode === 'defaultState'
    const withHoverDefaults = mode === 'hover'
    const withColorDefaults = withFullDefaults || withHoverDefaults

    return z.object({
      width: optionalDefault(withRef(z.string()), withFullDefaults, '2.5rem'),
      height: optionalDefault(withRef(z.string()), withFullDefaults, '2.5rem'),
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
            width: '{{primitives.border.width.none}}',
            offset: '{{primitives.border.offset.none}}',
            radius: '{{primitives.border.radius.md}}',
          })
        : withHoverDefaults
          ? border.default({
              color: `{{${statePath}.defaultSeverity.border.color}}`,
            })
          : border.optional(),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    'defaultState',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPanelButtonStateContentDefaulted' })

  static readonly defaultedHoverStateContentSchema = this.createStateContent(
    'hover',
    'primitives.area.overlay.state.hover'
  ).register(themeSchemaRegistry, { id: 'calendarPanelButtonStateContentHoverDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    'none',
    'primitives.area.overlay.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarPanelButtonStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema
    const hoverSchema = withDefaults ? this.defaultedHoverStateContentSchema : this.undefaultedStateContentSchema

    return z.object({
      width: optionalDefault(withRef(z.string()), withDefaults, '2.5rem'),
      height: optionalDefault(withRef(z.string()), withDefaults, '2.5rem'),
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
      active: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      disabled: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarPanelButtonUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, {
    id: 'calendarPanelButtonDefaulted',
  })
}

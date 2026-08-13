import * as z from 'zod'
import { bg, borderWithShadow, color, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

/**
 * Schema for icon styles used in the calendar input field.
 */
export class CalendarIconSchema {
  private static createStateContent(withDefaults: boolean, statePath: string) {
    return z.object({
      padding: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.space.md}}'),
      width: optionalDefault(withRef(z.string()), withDefaults, '2.5rem'),
      height: optionalDefault(withRef(z.string()), withDefaults, '2.5rem'),
      color: optionalDefault(color, withDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent(
    true,
    'primitives.defaultVariant.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarIconStateContentDefaulted' })

  static readonly undefaultedStateContentSchema = this.createStateContent(
    false,
    'primitives.defaultVariant.defaultState'
  ).register(themeSchemaRegistry, { id: 'calendarIconStateContentUndefaulted' })

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema

    return z.object({
      focusRing: optionalDefault(borderWithShadow, withDefaults, {
        color: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      }),
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      disabled: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      invalid: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      active: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarIconUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, { id: 'calendarIconDefaulted' })
}

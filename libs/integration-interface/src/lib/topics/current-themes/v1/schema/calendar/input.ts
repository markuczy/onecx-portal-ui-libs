import * as z from 'zod'
import { bg, border, borderWithShadow, color, font, withRef } from '../primitives'
import { themeSchemaRegistry } from '../registry'
import { CalendarIconSchema } from './inputicon'

const optionalDefault = <T extends z.ZodTypeAny>(schema: T, withDefaults: boolean, defaultValue: z.infer<T>) =>
  withDefaults ? schema.default(defaultValue as never) : schema.optional()

type CalendarInputStateMode = 'defaultState' | 'hover' | 'none'

/**
 * Input field in the calendar header panel schema.
 */
export class CalendarInputSchema {
  private static createStateContent(mode: CalendarInputStateMode) {
    const withFullDefaults = mode === 'defaultState'
    const withHoverDefaults = mode === 'hover'
    const withColorDefaults = withFullDefaults || withHoverDefaults
    const statePath = withFullDefaults
      ? 'primitives.defaultVariant.defaultState'
      : 'primitives.defaultVariant.state.hover'
    const iconSchema = withFullDefaults ? CalendarIconSchema.schema : CalendarIconSchema.schemaNoDefaults

    return z.object({
      padding: optionalDefault(withRef(z.string()), withFullDefaults, '{{primitives.space.md}}'),
      shadow: optionalDefault(withRef(z.string()), withFullDefaults, '{{primitives.shadow.md}}'),
      font: optionalDefault(font.pick({ family: true, size: true, weight: true }), withFullDefaults, {
        family: '{{primitives.font.family}}',
        size: '{{primitives.font.size}}',
        weight: '{{primitives.font.weight}}',
      }),
      background: optionalDefault(
        z.union([bg, withRef(z.string())]),
        withColorDefaults,
        `{{${statePath}.defaultSeverity.bg}}`
      ),
      color: optionalDefault(color, withColorDefaults, `{{${statePath}.defaultSeverity.contrast}}`),
      border: withFullDefaults
        ? border.default({
            color: `{{${statePath}.defaultSeverity.border.color}}`,
            style: `{{${statePath}.defaultSeverity.border.style}}`,
            width: '{{primitives.border.width.md}}',
            radius: '{{primitives.border.radius.md}}',
            offset: '{{primitives.border.offset.none}}',
          })
        : withHoverDefaults
          ? border.default({
              color: `{{${statePath}.defaultSeverity.border.color}}`,
            })
          : border.optional(),
      placeholderColor: optionalDefault(
        color,
        withColorDefaults,
        `{{${statePath}.defaultSeverity.contrast}}`
      ),
      icon: (iconSchema as typeof CalendarIconSchema.schema).prefault({}),
    })
  }

  private static createSizeSchema(withDefaults: boolean, paddingToken: string) {
    return z.object({
      padding: optionalDefault(withRef(z.string()), withDefaults, paddingToken),
      fontSize: optionalDefault(withRef(z.string()), withDefaults, '{{primitives.font.size}}'),
    })
  }

  static readonly defaultedDefaultStateContentSchema = this.createStateContent('defaultState').register(
    themeSchemaRegistry,
    { id: 'calendarInputStateContentDefaulted' }
  )

  static readonly defaultedHoverStateContentSchema = this.createStateContent('hover').register(themeSchemaRegistry, {
    id: 'calendarInputStateContentHoverDefaulted',
  })

  static readonly undefaultedStateContentSchema = this.createStateContent('none').register(themeSchemaRegistry, {
    id: 'calendarInputStateContentUndefaulted',
  })

  static readonly smSchemaDefaulted = this.createSizeSchema(true, '{{primitives.space.sm}}').register(
    themeSchemaRegistry,
    { id: 'calendarInputSmDefaulted' }
  )

  static readonly smSchemaUndefaulted = this.createSizeSchema(false, '{{primitives.space.sm}}').register(
    themeSchemaRegistry,
    { id: 'calendarInputSmUndefaulted' }
  )

  static readonly lgSchemaDefaulted = this.createSizeSchema(true, '{{primitives.space.lg}}').register(
    themeSchemaRegistry,
    { id: 'calendarInputLgDefaulted' }
  )

  static readonly lgSchemaUndefaulted = this.createSizeSchema(false, '{{primitives.space.lg}}').register(
    themeSchemaRegistry,
    { id: 'calendarInputLgUndefaulted' }
  )

  private static createSchema(withDefaults: boolean) {
    const defaultStateSchema = withDefaults
      ? this.defaultedDefaultStateContentSchema
      : this.undefaultedStateContentSchema
    const sizeSmSchema = withDefaults ? this.smSchemaDefaulted : this.smSchemaUndefaulted
    const sizeLgSchema = withDefaults ? this.lgSchemaDefaulted : this.lgSchemaUndefaulted
    const hoverSchema = withDefaults ? this.defaultedHoverStateContentSchema : this.undefaultedStateContentSchema

    return z.object({
      sm: (sizeSmSchema as typeof sizeSmSchema).prefault({}),
      lg: (sizeLgSchema as typeof sizeLgSchema).prefault({}),
      focusRing: optionalDefault(borderWithShadow, withDefaults, {
        color: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      }),
      defaultState: (defaultStateSchema as typeof defaultStateSchema).prefault({}),
      hover: (hoverSchema as typeof hoverSchema).prefault({}),
      focus: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      disabled: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      invalid: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
      active: (this.undefaultedStateContentSchema as typeof this.undefaultedStateContentSchema).prefault({}),
    })
  }

  static readonly schemaNoDefaults = this.createSchema(false).register(themeSchemaRegistry, {
    id: 'calendarInputUndefaulted',
  })

  static readonly schema = this.createSchema(true).register(themeSchemaRegistry, { id: 'calendarInputDefaulted' })
}

import { calendar } from './calendar'
import { expectExactTokens, expectExactUndefinedTokens, expectUndefinedTokens } from './test-utils'

const parseCalendar = () => {
  const result = calendar.safeParse({})

  expect(result.success).toBe(true)

  return result.data
}

const expectPanelButtonDefaultState = (value: Record<string, unknown> | undefined, statePath: string) => {
  expectExactTokens(value, {
    width: '2.5rem',
    height: '2.5rem',
    color: `{{${statePath}.defaultSeverity.contrast}}`,
    background: `{{${statePath}.defaultSeverity.bg}}`,
    border: {
      color: `{{${statePath}.defaultSeverity.border.color}}`,
      style: `{{${statePath}.defaultSeverity.border.style}}`,
      width: '{{primitives.border.width.none}}',
      offset: '{{primitives.border.offset.none}}',
      radius: '{{primitives.border.radius.md}}',
    },
  })
}

const expectPanelButtonHoverState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    color: '{{primitives.area.overlay.state.hover.defaultSeverity.contrast}}',
    background: '{{primitives.area.overlay.state.hover.defaultSeverity.bg}}',
    border: {
      color: '{{primitives.area.overlay.state.hover.defaultSeverity.border.color}}',
    },
  })
}

const expectIconDefaultState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    padding: '{{primitives.space.md}}',
    width: '2.5rem',
    height: '2.5rem',
    color: '{{primitives.defaultVariant.defaultState.defaultSeverity.contrast}}',
    background: '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}',
  })
}

const expectInputDefaultState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    padding: '{{primitives.space.md}}',
    shadow: '{{primitives.shadow.md}}',
    font: {
      family: '{{primitives.font.family}}',
      size: '{{primitives.font.size}}',
      weight: '{{primitives.font.weight}}',
    },
    background: '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}',
    color: '{{primitives.defaultVariant.defaultState.defaultSeverity.contrast}}',
    border: {
      color: '{{primitives.defaultVariant.defaultState.defaultSeverity.border.color}}',
      style: '{{primitives.defaultVariant.defaultState.defaultSeverity.border.style}}',
      width: '{{primitives.border.width.md}}',
      radius: '{{primitives.border.radius.md}}',
      offset: '{{primitives.border.offset.none}}',
    },
    placeholderColor: '{{primitives.defaultVariant.defaultState.defaultSeverity.contrast}}',
    icon: expect.any(Object),
  })
}

const expectInputHoverState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    background: '{{primitives.defaultVariant.state.hover.defaultSeverity.bg}}',
    color: '{{primitives.defaultVariant.state.hover.defaultSeverity.contrast}}',
    border: {
      color: '{{primitives.defaultVariant.state.hover.defaultSeverity.border.color}}',
    },
    placeholderColor: '{{primitives.defaultVariant.state.hover.defaultSeverity.contrast}}',
    icon: expect.any(Object),
  })
}

const expectNavigationSelectorDefaultState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    padding: '{{primitives.space.sm}}',
    font: {
      weight: '{{primitives.font.weight}}',
      size: '{{primitives.font.size}}',
    },
    border: {
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
      style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
      width: '{{primitives.border.width.none}}',
      offset: '{{primitives.border.offset.none}}',
      radius: '{{primitives.border.radius.md}}',
    },
    background: '{{primitives.area.overlay.defaultState.defaultSeverity.bg}}',
    color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
  })
}

const expectNavigationSelectorHoverState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    background: '{{primitives.area.overlay.state.hover.defaultSeverity.bg}}',
    color: '{{primitives.area.overlay.state.hover.defaultSeverity.contrast}}',
  })
}

const expectPickerCellDefaultState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    width: '2.5rem',
    height: '2.5rem',
    padding: '{{primitives.space.xs}}',
    font: {
      weight: '{{primitives.font.weight}}',
      size: '{{primitives.font.size}}',
    },
    color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
    background: '{{primitives.area.overlay.defaultState.defaultSeverity.bg}}',
    border: {
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
      style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
      width: '{{primitives.border.width.sm}}',
      offset: '{{primitives.border.offset.none}}',
      radius: '{{primitives.border.radius.md}}',
    },
  })
}

const expectPickerCellHoverState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    color: '{{primitives.area.overlay.state.hover.defaultSeverity.contrast}}',
    background: '{{primitives.area.overlay.state.hover.defaultSeverity.bg}}',
    border: {
      color: '{{primitives.area.overlay.state.hover.defaultSeverity.border.color}}',
    },
  })
}

const expectPickerCellSelectedState = (value: Record<string, unknown> | undefined) => {
  expectExactTokens(value, {
    color: '{{primitives.area.overlay.state.selected.defaultSeverity.contrast}}',
    background: '{{primitives.area.overlay.state.selected.defaultSeverity.bg}}',
    border: {
      color: '{{primitives.area.overlay.state.selected.defaultSeverity.border.color}}',
    },
    inRangeBackground: '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}',
    rangeSelectedBackground: '{{primitives.area.overlay.state.selected.defaultSeverity.bg}}',
  })
}

describe('calendar schema', () => {
  it('parses an empty object', () => {
    const result = calendar.safeParse({})

    expect(result.success).toBe(true)
  })

  it('applies root defaults and flattens variant keys', () => {
    const value = parseCalendar()

    expectExactUndefinedTokens(value, calendar.shape, ['settings'])
    expectExactTokens(value, {
      defaultVariant: expect.any(Object),
      primary: expect.any(Object),
      secondary: expect.any(Object),
      tertiary: expect.any(Object),
      quaternary: expect.any(Object),
      quinary: expect.any(Object),
      multiMonthDivider: expect.any(Object),
      transitionDuration: '{{primitives.transition.duration}}',
    })
  })

  it('keeps defaultVariant input defaults on the default chain only', () => {
    const value = parseCalendar()
    const input = value?.defaultVariant?.input

    expectExactTokens(input, {
      sm: {
        padding: '{{primitives.space.sm}}',
        fontSize: '{{primitives.font.size}}',
      },
      lg: {
        padding: '{{primitives.space.lg}}',
        fontSize: '{{primitives.font.size}}',
      },
      focusRing: {
        color: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      },
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
      disabled: expect.any(Object),
      invalid: expect.any(Object),
      active: expect.any(Object),
    })

    expectInputDefaultState(input?.defaultState)
    expectInputHoverState(input?.hover)
    expectUndefinedTokens(input?.focus, [
      'padding',
      'shadow',
      'font',
      'background',
      'color',
      'border',
      'placeholderColor',
    ])
  })

  it('keeps nested icon defaults only under input.defaultState', () => {
    const value = parseCalendar()
    const defaultStateIcon = value?.defaultVariant?.input?.defaultState?.icon
    const hoverIcon = value?.defaultVariant?.input?.hover?.icon

    expectExactTokens(defaultStateIcon, {
      focusRing: {
        color: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.defaultVariant.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      },
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
      disabled: expect.any(Object),
      invalid: expect.any(Object),
      active: expect.any(Object),
    })
    expectIconDefaultState(defaultStateIcon?.defaultState)

    expectExactTokens(hoverIcon, {
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
      disabled: expect.any(Object),
      invalid: expect.any(Object),
      active: expect.any(Object),
    })
    expectUndefinedTokens(hoverIcon?.defaultState, ['padding', 'width', 'height', 'color', 'background'])
    expectUndefinedTokens(hoverIcon?.hover, ['padding', 'width', 'height', 'color', 'background'])
  })

  it('defaults panel descendants only through nested defaultState branches', () => {
    const value = parseCalendar()
    const panel = value?.defaultVariant?.panel
    const header = panel?.defaultState?.header
    const selector = header?.defaultState?.selectMonth
    const datePanel = panel?.defaultState?.datePanel
    const dayView = datePanel?.defaultState?.dayView
    const dateCell = dayView?.defaultState?.['dateCell'] as Record<string, unknown> | undefined
    const timePicker = panel?.defaultState?.timePicker
    const footerButtonBar = panel?.defaultState?.footerButtonBar

    expectExactTokens(panel?.defaultState, {
      background: '{{primitives.area.overlay.defaultState.defaultSeverity.bg}}',
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
      border: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
        width: '{{primitives.border.width.sm}}',
        offset: '{{primitives.border.offset.none}}',
        radius: '{{primitives.border.radius.sm}}',
        shadow: '{{primitives.shadow.sm}}',
      },
      padding: '{{primitives.space.md}}',
      headerGap: '{{primitives.space.sm}}',
      header: expect.any(Object),
      datePanel: expect.any(Object),
      timePicker: expect.any(Object),
      footerButtonBar: expect.any(Object),
    })
    expectUndefinedTokens(panel?.hover, ['background', 'color', 'border', 'padding', 'headerGap'])

    expectExactTokens(header?.defaultState, {
      background: '{{primitives.area.overlay.defaultState.defaultSeverity.bg}}',
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
      padding: '{{primitives.space.md}}',
      margin: '{{primitives.space.md}}',
      gap: '{{primitives.space.sm}}',
      selectMonth: expect.any(Object),
      selectYear: expect.any(Object),
      navButton: expect.any(Object),
    })
    expectUndefinedTokens(header?.hover, ['background', 'color', 'padding', 'margin', 'gap'])

    expectExactTokens(selector, {
      focusRing: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      },
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
    })
    expectNavigationSelectorDefaultState(selector?.defaultState)
    expectNavigationSelectorHoverState(selector?.hover)
    expectUndefinedTokens(selector?.focus, ['padding', 'font', 'border', 'background', 'color'])

    expectExactTokens(datePanel?.defaultState, {
      background: '{{primitives.area.overlay.defaultState.defaultSeverity.bg}}',
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
      padding: '{{primitives.space.md}}',
      margin: '{{primitives.space.md}}',
      weekDayLabel: expect.any(Object),
      dayView: expect.any(Object),
      monthView: expect.any(Object),
      yearView: expect.any(Object),
      today: expect.any(Object),
    })
    expectExactTokens(datePanel?.defaultState?.weekDayLabel, {
      padding: '{{primitives.space.xs}}',
      font: {
        weight: '{{primitives.font.weight.bold}}',
        size: '{{primitives.font.size}}',
      },
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
    })
    expectExactTokens(datePanel?.defaultState?.today, {
      background: '{{primitives.defaultVariant.defaultState.defaultSeverity.bg}}',
      color: '{{primitives.defaultVariant.defaultState.defaultSeverity.contrast}}',
    })

    expectExactTokens(dayView?.defaultState, {
      margin: '{{primitives.space.md}}',
      dateCell: expect.any(Object),
    })
    expectExactTokens(dayView?.hover, {
      dateCell: expect.any(Object),
    })
    expectUndefinedTokens(dayView?.hover, ['margin'])

    expectPickerCellDefaultState(dateCell?.['defaultState'] as Record<string, unknown> | undefined)
    expectPickerCellHoverState(dateCell?.['hover'] as Record<string, unknown> | undefined)
    expectPickerCellSelectedState(dateCell?.['selected'] as Record<string, unknown> | undefined)
    expectUndefinedTokens(dateCell?.['focus'] as Record<string, unknown> | undefined, [
      'width',
      'height',
      'padding',
      'font',
      'color',
      'background',
      'border',
      'inRangeBackground',
      'rangeSelectedBackground',
    ])

    expectExactTokens(timePicker?.defaultState, {
      padding: '{{primitives.space.md}}',
      border: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
        width: '{{primitives.border.width.md}}',
        radius: '{{primitives.border.radius.md}}',
        offset: '{{primitives.border.offset.none}}',
      },
      gap: '{{primitives.space.md}}',
      buttonGap: '{{primitives.space.xs}}',
      margin: '{{primitives.space.md}}',
      timePickerButton: expect.any(Object),
    })
    expectExactTokens(timePicker?.timeSeparator, {
      color: '{{primitives.area.overlay.defaultState.defaultSeverity.contrast}}',
      padding: '{{primitives.space.xs}}',
      font: {
        family: '{{primitives.font.family}}',
        size: '{{primitives.font.size}}',
        weight: '{{primitives.font.weight}}',
      },
    })
    expectUndefinedTokens(timePicker?.hover, ['padding', 'border', 'gap', 'buttonGap', 'margin'])

    expectExactTokens(footerButtonBar?.defaultState, {
      padding: '{{primitives.space.md}}',
      border: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
        width: '{{primitives.border.width.md}}',
        radius: '{{primitives.border.radius.md}}',
        offset: '{{primitives.border.offset.none}}',
      },
      gap: '{{primitives.space.md}}',
      todayButton: expect.any(Object),
      clearButton: expect.any(Object),
    })
    expectUndefinedTokens(footerButtonBar?.hover, ['padding', 'border', 'gap'])
  })

  it('applies approved panel button defaults and removes the rest', () => {
    const value = parseCalendar()
    const rootButton = value?.defaultVariant?.calendarIconButton
    const navButton = value?.defaultVariant?.panel?.defaultState?.header?.defaultState?.navButton
    const timePickerButton = value?.defaultVariant?.panel?.defaultState?.timePicker?.defaultState?.timePickerButton
    const todayButton = value?.defaultVariant?.panel?.defaultState?.footerButtonBar?.defaultState?.todayButton
    const clearButton = value?.defaultVariant?.panel?.defaultState?.footerButtonBar?.defaultState?.clearButton

    expectExactTokens(rootButton, {
      width: '2.5rem',
      height: '2.5rem',
      focusRing: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.focusRing.style}}',
        width: '{{primitives.border.width.md}}',
        offset: '{{primitives.border.offset.none}}',
        shadow: '{{primitives.shadow.none}}',
        radius: '{{primitives.radius.md}}',
      },
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
      active: expect.any(Object),
      disabled: expect.any(Object),
    })
    expectPanelButtonDefaultState(rootButton?.defaultState, 'primitives.area.overlay.defaultState')
    expectPanelButtonHoverState(rootButton?.hover)
    expectUndefinedTokens(rootButton?.focus, ['width', 'height', 'color', 'background', 'border'])

    expectPanelButtonDefaultState(navButton?.defaultState, 'primitives.area.overlay.defaultState')
    expectPanelButtonHoverState(navButton?.hover)
    expectPanelButtonDefaultState(timePickerButton?.defaultState, 'primitives.area.overlay.defaultState')
    expectPanelButtonHoverState(timePickerButton?.hover)
    expectPanelButtonDefaultState(todayButton?.defaultState, 'primitives.area.overlay.defaultState')
    expectPanelButtonHoverState(todayButton?.hover)
    expectPanelButtonDefaultState(clearButton?.defaultState, 'primitives.area.overlay.defaultState')
    expectPanelButtonHoverState(clearButton?.hover)
  })

  it('leaves named variants fully undefaulted', () => {
    const value = parseCalendar()
    const primaryInput = value?.primary?.input
    const primaryPanel = value?.primary?.panel
    const primaryButton = value?.primary?.calendarIconButton
    const primarySelector = primaryPanel?.defaultState?.header?.defaultState?.selectMonth
    const primaryDateCell = primaryPanel?.defaultState?.datePanel?.defaultState?.dayView?.defaultState?.[
      'dateCell'
    ] as Record<string, unknown> | undefined
    const primaryToday = primaryPanel?.defaultState?.datePanel?.defaultState?.today
    const primaryTimeSeparator = primaryPanel?.defaultState?.timePicker?.timeSeparator

    expectExactTokens(primaryInput, {
      sm: expect.any(Object),
      lg: expect.any(Object),
      defaultState: expect.any(Object),
      hover: expect.any(Object),
      focus: expect.any(Object),
      disabled: expect.any(Object),
      invalid: expect.any(Object),
      active: expect.any(Object),
    })
    expectUndefinedTokens(primaryInput?.sm, ['padding', 'fontSize'])
    expectUndefinedTokens(primaryInput?.lg, ['padding', 'fontSize'])
    expect(primaryInput?.focusRing).toBeUndefined()
    expectUndefinedTokens(primaryInput?.defaultState, [
      'padding',
      'shadow',
      'font',
      'background',
      'color',
      'border',
      'placeholderColor',
    ])
    expect(primaryInput?.defaultState?.icon?.focusRing).toBeUndefined()

    expect(primaryPanel?.defaultState?.background).toBeUndefined()
    expect(primaryPanel?.defaultState?.border).toBeUndefined()
    expect(primaryButton?.focusRing).toBeUndefined()
    expectUndefinedTokens(primaryButton?.defaultState, ['width', 'height', 'color', 'background', 'border'])

    expect(primarySelector?.focusRing).toBeUndefined()
    expectUndefinedTokens(primarySelector?.defaultState, ['padding', 'font', 'border', 'background', 'color'])

    expectExactTokens(primaryPanel?.defaultState?.datePanel?.defaultState?.dayView?.defaultState, {
      dateCell: expect.any(Object),
    })
    expect(primaryPanel?.defaultState?.datePanel?.defaultState?.dayView?.defaultState?.['margin']).toBeUndefined()
    expectUndefinedTokens(primaryDateCell?.['defaultState'] as Record<string, unknown> | undefined, [
      'width',
      'height',
      'padding',
      'font',
      'color',
      'background',
      'border',
      'inRangeBackground',
      'rangeSelectedBackground',
    ])
    expectUndefinedTokens(primaryDateCell?.['selected'] as Record<string, unknown> | undefined, [
      'width',
      'height',
      'padding',
      'font',
      'color',
      'background',
      'border',
      'inRangeBackground',
      'rangeSelectedBackground',
    ])

    expect(primaryToday?.background).toBeUndefined()
    expect(primaryToday?.color).toBeUndefined()
    expect(primaryTimeSeparator?.color).toBeUndefined()
    expect(primaryTimeSeparator?.padding).toBeUndefined()
  })

  it('keeps root-level non-variant defaults unchanged', () => {
    const value = parseCalendar()

    expectExactTokens(value?.multiMonthDivider, {
      border: {
        color: '{{primitives.area.overlay.defaultState.defaultSeverity.border.color}}',
        style: '{{primitives.area.overlay.defaultState.defaultSeverity.border.style}}',
        width: '{{primitives.border.width.none}}',
        offset: '{{primitives.border.offset.none}}',
        radius: '{{primitives.border.radius.md}}',
      },
      gap: '{{primitives.space.md}}',
    })
  })
})

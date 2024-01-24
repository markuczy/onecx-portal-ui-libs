import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DialogButtonClicked, DialogResult, DialogState, PortalDialogService } from './portal-dialog.service'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { Component, Input } from '@angular/core'
import { ButtonDialogHarness } from '../../../testing/button-dialog.harness'
import { ButtonDialogComponent } from '../core/components/button-dialog/button-dialog.component'
import { CommonModule } from '@angular/common'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { DialogHostComponent } from '../core/components/button-dialog/dialog-host/dialog-host.component'
import { ButtonModule } from 'primeng/button'
import { Observable, of } from 'rxjs'

@Component({
  template: `<h1>BaseTestComponent</h1>`,
})
class BaseTestComponent {
  resultFromShow: DialogState<any> | undefined = undefined
  constructor(public portalDialogService: PortalDialogService) {}

  show(title: any, message: any, button1: any, button2?: any, showCloseButton: any = true) {
    this.portalDialogService.openNew(title, message, button1, button2, showCloseButton).subscribe({
      next: (result) => {
        this.resultFromShow = result
      },
    })
  }
}

@Component({
  template: `<h1 id="testHeader">{{ header }}</h1>`,
})
class TestWithInputsComponent {
  @Input() header = 'header'
}

@Component({
  template: `<h1>DialogResultTestComponent</h1>`,
})
class DialogResultTestComponent implements DialogResult<string> {
  @Input() dialogResult = ''

  constructor(public portalDialogService: PortalDialogService) {}
}

@Component({
  template: `<h1></h1>`,
})
class DialogButtonClickedWithResultComponent implements DialogResult<number>, DialogButtonClicked {
  @Input() dialogResult = 13
  @Input() returnType: 'boolean' | 'observable' | 'promise' | 'undefined' = 'boolean'
  @Input() expectedDialogResult = 25

  constructor(public portalDialogService: PortalDialogService) {}

  ocxDialogButtonClicked(state: DialogState<number>): boolean | Observable<boolean> | Promise<boolean> | undefined {
    if (this.returnType === 'boolean') {
      if (state.result === this.expectedDialogResult) {
        return true
      } else {
        return false
      }
    } else if (this.returnType === 'observable') {
      if (state.result === this.expectedDialogResult) {
        return of(true)
      } else {
        return of(false)
      }
    } else if (this.returnType === 'promise') {
      if (state.result === this.expectedDialogResult) {
        return Promise.resolve(true)
      } else {
        return Promise.resolve(false)
      }
    }

    return undefined
  }
}

describe('PortalDialogService', () => {
  let pDialogService: DialogService
  let rootLoader: HarnessLoader
  let fixture: ComponentFixture<BaseTestComponent>

  const translations = {
    TITLE_TRANSLATE: 'basicTitle',
    TITLE_TRANSLATE_PARAM: 'translatedTitle {{val}}',
    MESSAGE: 'myMessage',
    MESSAGE_PARAM: 'myMessage {{val}}',
    BUTTON: 'myButton',
    BUTTON_PARAM: 'myButton {{val}}',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseTestComponent, ButtonDialogComponent, DialogHostComponent],
      imports: [
        TranslateTestingModule.withTranslations('en', translations),
        DynamicDialogModule,
        CommonModule,
        NoopAnimationsModule,
        ButtonModule,
      ],
      providers: [PortalDialogService, DialogService],
    }).compileComponents()
    fixture = TestBed.createComponent(BaseTestComponent)
    pDialogService = TestBed.inject(DialogService)
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
    jest.clearAllMocks()
  })

  it('should display dialog with translated title', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('TITLE_TRANSLATE', 'message', 'button1', 'button2')
    fixture.detectChanges()

    expect(pDialogService.open).toHaveBeenCalledWith(
      ButtonDialogComponent,
      expect.objectContaining({
        header: translations['TITLE_TRANSLATE'],
      })
    )
  })

  it('should display dialog with translated title with parameters', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      { key: 'TITLE_TRANSLATE_PARAM', parameters: { val: 'myParam' } },
      'message',
      'button1',
      'button2'
    )
    fixture.detectChanges()

    expect(pDialogService.open).lastCalledWith(
      ButtonDialogComponent,
      expect.objectContaining({
        header: 'translatedTitle myParam',
      })
    )
  })

  it('should display dialog with translated message', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'MESSAGE', 'button1', 'button2')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const message = await dialogHarness.getTextFor('#dialogMessage')
    expect(message).toEqual(translations['MESSAGE'])
  })

  it('should display dialog with translated message with parameters', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      { key: 'MESSAGE_PARAM', parameters: { val: 'myMsgParam' } },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const message = await dialogHarness.getTextFor('#dialogMessage')
    expect(message).toEqual('myMessage myMsgParam')
  })

  it('should display dialog with translated buttons', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'BUTTON', 'BUTTON')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const primaryButtonLabel = await dialogHarness.getPrimaryButtonlabel()
    expect(primaryButtonLabel).toBe(translations['BUTTON'])
    const secondaryButtonLabel = await dialogHarness.getSecondaryButtonlabel()
    expect(secondaryButtonLabel).toBe(translations['BUTTON'])
  })

  it('should display dialog with translated buttons with parameters', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      'message',
      { key: 'BUTTON_PARAM', parameters: { val: 'myButtonParam1' } },
      { key: 'BUTTON_PARAM', parameters: { val: 'myButtonParam2' } }
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const primaryButtonLabel = await dialogHarness.getPrimaryButtonlabel()
    expect(primaryButtonLabel).toBe('myButton myButtonParam1')
    const secondaryButtonLabel = await dialogHarness.getSecondaryButtonlabel()
    expect(secondaryButtonLabel).toBe('myButton myButtonParam2')
  })

  it('should display dialog with translated buttons with icons', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      'message',
      { key: 'BUTTON', icon: 'pi pi-times' },
      { key: 'BUTTON', icon: 'pi pi-trash' }
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const primaryButtonLabel = await dialogHarness.getPrimaryButtonlabel()
    const primaryButtonIcon = await dialogHarness.getPrimaryButtonIcon()
    expect(primaryButtonLabel).toBe(translations['BUTTON'])
    expect(primaryButtonIcon).toBe('pi pi-times')

    const secondaryButtonLabel = await dialogHarness.getSecondaryButtonlabel()
    const secondaryButtonIcon = await dialogHarness.getSecondaryButtonIcon()
    expect(secondaryButtonLabel).toBe(translations['BUTTON'])
    expect(secondaryButtonIcon).toBe('pi pi-trash')
  })

  it('should display dialog with message and icon if DialogMessage provided as string and icon', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', { message: 'MESSAGE', icon: 'pi pi-times' }, 'button1', 'button2')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const message = await dialogHarness.getTextFor('#dialogMessage')
    expect(message).toEqual(translations['MESSAGE'])
    const icon = await dialogHarness.getAttributeFor('i', 'class')
    expect(icon).toContain('pi pi-times')
  })

  it('should display dialog with message and icon if DialogMessage provided as TranslationKey and icon', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      { message: { key: 'MESSAGE_PARAM', parameters: { val: 'dialogMessageParam' } }, icon: 'pi pi-times' },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const message = await dialogHarness.getTextFor('#dialogMessage')
    expect(message).toEqual('myMessage dialogMessageParam')
    const icon = await dialogHarness.getAttributeFor('i', 'class')
    expect(icon).toContain('pi pi-times')
  })

  it('should display dialog with custom component if provided', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', { type: TestWithInputsComponent }, 'button1', 'button2')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const headerValue = await dialogHarness.getTextFor('#testHeader')
    expect(headerValue).toEqual('header')
  })

  it('should display dialog with custom component and inputs if provided', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: TestWithInputsComponent,
        inputs: {
          header: 'myCustomHeader',
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const headerValue = await dialogHarness.getTextFor('#testHeader')
    expect(headerValue).toEqual('myCustomHeader')
  })

  it('should display dialog with single button if secondary not provided', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    const primaryButtonLabel = await dialogHarness.getPrimaryButtonlabel()
    expect(primaryButtonLabel).toBe('button1')
    const secondaryButtonLabel = await dialogHarness.getSecondaryButtonlabel()
    expect(secondaryButtonLabel).toBeUndefined()
  })

  it('should display dialog without top close button when one button defined', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1', undefined, true)
    fixture.detectChanges()

    expect(pDialogService.open).toHaveBeenCalledWith(
      ButtonDialogComponent,
      expect.objectContaining({
        closable: false,
      })
    )
  })

  it('should display dialog without top close button when both buttons defined but specified to remove the button', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1', 'button2', false)
    fixture.detectChanges()

    expect(pDialogService.open).toHaveBeenCalledWith(
      ButtonDialogComponent,
      expect.objectContaining({
        closable: false,
      })
    )
  })

  it('should display dialog with top close button when both buttons defined and enabled', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1', 'button2', true)
    fixture.detectChanges()

    expect(pDialogService.open).toHaveBeenCalledWith(
      ButtonDialogComponent,
      expect.objectContaining({
        closable: true,
      })
    )
  })

  it('should return dialogState with primary on primaryButton click', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1', 'button2')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('primary')
    expect(result?.result).toBeUndefined()
  })

  it('should return dialogState with secondary on primaryButton click', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show('title', 'message', 'button1', 'button2')
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickSecondaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('secondary')
    expect(result?.result).toBeUndefined()
  })

  it('should return dialogState with primary and dialogResult on primaryButton click when component implements DialogResult<T>', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      { type: DialogResultTestComponent, inputs: { dialogResult: 'resultAssignedLater' } },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('primary')
    expect(result?.result).toBe('resultAssignedLater')
  })

  it('should not close dialog when ocxDialogButtonClicked returns false', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'boolean',
          dialogResult: 1,
          expectedDialogResult: 2,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeUndefined()
  })

  it('should close dialog when ocxDialogButtonClicked returns true', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'boolean',
          dialogResult: 1,
          expectedDialogResult: 1,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('primary')
    expect(result?.result).toBe(1)
  })

  it('should not close dialog when ocxDialogButtonClicked returns Observable of false', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'observable',
          dialogResult: 1,
          expectedDialogResult: 2,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeUndefined()
  })

  it('should close dialog when ocxDialogButtonClicked returns Observable of true', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'observable',
          dialogResult: 4,
          expectedDialogResult: 4,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('primary')
    expect(result?.result).toBe(4)
  })

  it('should not close dialog when ocxDialogButtonClicked returns Promise of false', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'promise',
          dialogResult: 1,
          expectedDialogResult: 2,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeUndefined()
  })

  it('should close dialog when ocxDialogButtonClicked returns Promise of true', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'promise',
          dialogResult: 10,
          expectedDialogResult: 10,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result).toBeDefined()
    expect(result?.button).toBe('primary')
    expect(result?.result).toBe(10)
  })

  it('should close dialog when ocxDialogButtonClicked returns undefined', async () => {
    jest.spyOn(pDialogService, 'open')

    fixture.componentInstance.show(
      'title',
      {
        type: DialogButtonClickedWithResultComponent,
        inputs: {
          returnType: 'undefined',
          dialogResult: 13,
          expectedDialogResult: 10,
        },
      },
      'button1',
      'button2'
    )
    fixture.detectChanges()

    const dialogHarness = await rootLoader.getHarness(ButtonDialogHarness)
    await dialogHarness.clickPrimaryButton()
    const result = fixture.componentInstance.resultFromShow
    expect(result?.button).toBe('primary')
    expect(result?.result).toBe(13)
  })
})

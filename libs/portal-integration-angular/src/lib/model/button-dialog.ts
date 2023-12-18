import { EventEmitter, Type } from '@angular/core'

export interface ButtonDialogDetails {
  label: string
  icon?: string // sollte beides optional sein. Wenn es keins gibt, keins anzeigen.
  valueToEmit?: any // wenn valueToEmit leer ist, dann label emitten
}

export interface ButtonDialogDynamicDialogDetails extends ButtonDialogDetails {
  closeDialog: boolean
}

export interface ButtonDialogConfig {
  mainButtonDetails?: ButtonDialogDetails | ButtonDialogDynamicDialogDetails
  sideButtonEnabled?: boolean
  sideButtonDetails?: ButtonDialogDetails | ButtonDialogDynamicDialogDetails
}

export interface ButtonDialogData {
  config: ButtonDialogConfig
  component?: Type<any>
  componentData: any
}

export interface ButtonDialogDynamicDialogConfig {
  config?: ButtonDialogConfig
  component?: Type<any>
  componentData?: any
  emitter?: EventEmitter<any>
}

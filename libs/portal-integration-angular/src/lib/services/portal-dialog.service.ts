import { Injectable, Type } from '@angular/core'
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Observable, map } from 'rxjs';

type TranslationKeyWithParameters = { key: string; parameters: any[] }
type TranslationKey = string | TranslationKeyWithParameters
interface DialogButtonDetails<T> { 
    key: string; parameters?: any[], icon?: string; valueToEmit?: T;
} //if valueToEmit undefined emit key

@Injectable({ providedIn: 'any' }) // muss any sein wegen translateService
export class PortalDialogService {

  constructor(private dialogService: DialogService) {} //klappt wahrscheinlich nicht weil DialogService nicht in root provided wird -> gibt eine Lösung machen wir dann
  /**
   * @deprecated
   */
  open(componentType: Type<any>, config: DynamicDialogConfig): DynamicDialogRef {
    return this.dialogService.open(componentType, config)
  }

  open<MT,ST>(
    componentTypeOrMessageTranslationKey: Type<any> | TranslationKey,
    mainButtonTranslationKeyOrDetails: TranslationKey | DialogButtonDetails<MT>,
    secondaryButtonTranslationKeyOrDetails?: TranslationKey | DialogButtonDetails<ST>, //when there is a secondaryButton a closeButton X is shown in the top of the dialog if showCloseButton is true
    showCloseButton: boolean = true 
  ): Observable<string | MT | ST> {
    console.log(componentTypeOrMessageTranslationKey, mainButtonTranslationKeyOrDetails, secondaryButtonTranslationKeyOrDetails, showCloseButton)
    return this.dialogService.open(...).onClose.pipe(map((result) => ...))
    throw 'not yet implemented'
  }
}
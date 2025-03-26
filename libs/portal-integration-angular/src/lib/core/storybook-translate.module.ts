import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { NgModule, inject } from '@angular/core'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateCombinedLoader } from '@onecx/angular-accelerator'
import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks'

export function translateLoader(http: HttpClient) {
  return new TranslateCombinedLoader(new TranslateHttpLoader(http, `./assets/i18n/`, '.json'))
}
/**
  A utility module adding i18N support for Storybook stories
 **/
@NgModule({
  exports: [TranslateModule],
  imports: [
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [provideAppStateServiceMock(), provideHttpClient(withInterceptorsFromDi())],
})
export class StorybookTranslateModule {
  constructor() {
    const translateService = inject(TranslateService)

    const lang = translateService.getBrowserLang()
    const supportedLanguages = ['de', 'en']
    if (lang && supportedLanguages.includes(lang)) {
      translateService.use(lang)
    } else {
      translateService.use('en')
    }
  }
}

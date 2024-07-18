import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgModule } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks'
import { TranslateCombinedLoader } from './utils/translate.combined.loader'
import { provideHttpClientTesting } from '@angular/common/http/testing'

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
  providers: [provideAppStateServiceMock(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
})
export class StorybookTranslateModule {
  constructor(translateService: TranslateService) {
    const lang = translateService.getBrowserLang()
    const supportedLanguages = ['de', 'en']
    if (lang && supportedLanguages.includes(lang)) {
      translateService.use(lang)
    } else {
      translateService.use('en')
    }
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { MessageModule } from 'primeng/message'
import { AngularAcceleratorPrimeNgModule } from '../../angular-accelerator-primeng.module'
import { SearchConfigComponent } from './search-config.component'
import { SearchConfigHarness } from '../../../../testing'
import { SearchConfigInfo } from '../../model/search-config-info'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SearchConfigComponent', () => {
  let translateService: TranslateService
  let component: SearchConfigComponent
  let fixture: ComponentFixture<SearchConfigComponent>

  const searchConfigs: SearchConfigInfo[] = [
    {
      id: '01',
      name: 'Simple search config',
    },
    {
      id: '02',
      name: 'Adapted search config',
    },
  ]

  const emptySearchConfigEntry: SearchConfigInfo[] = []

  const placeholderKey = 'OCX_SEARCH_HEADER.OCX_SEARCH_CONFIG.DROPDOWN_DEFAULT'

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SearchConfigComponent],
    imports: [NoopAnimationsModule,
        MessageModule,
        TranslateTestingModule.withTranslations({
            en: require('./../../../../assets/i18n/en.json'),
            de: require('./../../../../assets/i18n/de.json'),
        }),
        AngularAcceleratorPrimeNgModule,
        ReactiveFormsModule],
    providers: [
        {
            useValue: {
                baseHref: '/base/path',
                mountPath: '/base/path',
                remoteBaseUrl: 'http://localhost:4200',
                shellName: 'shell',
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents()

    fixture = TestBed.createComponent(SearchConfigComponent)
    component = fixture.componentInstance
    component.searchConfigs = searchConfigs
    translateService = TestBed.inject(TranslateService)
    translateService.setDefaultLang('en')
    translateService.use('en')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load the PDropdownHarness', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    expect(dropdown).toBeTruthy()
  })

  it('should open the dropdown', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    await dropdown?.open()
    expect(await dropdown?.isOpen()).toBeTruthy()
  })

  it('should display a dropdown with a hard coded search config', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    const items = await dropdown?.getDropdownItems()
    expect(items?.length).toEqual(searchConfigs.length)
  })

  it('should display no dropdown if the search config is empty', async () => {
    component.searchConfigs = emptySearchConfigEntry
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    expect(dropdown).toBeFalsy()
  })

  it('should display the values in the fields after selecting the fist hard coded search config', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    const selectedDropdownItem = await dropdown?.selectedDropdownItemText(0)
    expect(selectedDropdownItem).toEqual(searchConfigs[0].name)
  })

  it('should display the values in the fields after selecting the fist hard coded search config', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    const selectedDropdownItem = await dropdown?.selectedDropdownItemText(1)
    expect(selectedDropdownItem).toEqual(searchConfigs[1].name)
  })

  it('should display the values in the fields correctly after selecting the fist search config and then selecting the second search config', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    let selectedDropdownItem = await dropdown?.selectedDropdownItemText(0)
    selectedDropdownItem = await dropdown?.selectedDropdownItemText(1)
    expect(selectedDropdownItem).toEqual(searchConfigs[1].name)
  })

  it('should have the option to remove the selection', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    expect(await dropdown?.hasClearOption()).toBeTruthy()
  })

  it('should display the right default message', async () => {
    const searchConfigHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SearchConfigHarness)
    const dropdown = await searchConfigHarness.getSearchConfigDropdown()
    const definedDefaultKeyTranslation = translateService.instant(placeholderKey)
    expect(await dropdown?.getDefaultText()).toEqual(definedDefaultKeyTranslation)
  })
})

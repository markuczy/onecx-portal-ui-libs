import { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { Container, StartedContainer } from './container'

export interface KeycloakDetails {
  adminRealm: string
  adminUsername: string
  adminPassword: string
}

export class KeycloakContainer extends Container {
  private keycloakDetails: KeycloakDetails = {
    adminRealm: 'master',
    adminUsername: 'admin',
    adminPassword: 'admin',
  }
  constructor(image: string, name: string, alias: string, network: StartedNetwork) {
    super(image, name, alias, network)
  }

  public withAdminRealm(realm: string) {
    this.keycloakDetails.adminRealm = realm
    return this
  }

  public withAdminUsername(username: string) {
    this.keycloakDetails.adminUsername = username
    return this
  }

  public withAdminPassword(password: string) {
    this.keycloakDetails.adminPassword = password
    return this
  }

  public getAdminRealm() {
    return this.keycloakDetails.adminRealm
  }

  public getAdminUsername() {
    return this.keycloakDetails.adminUsername
  }

  public getAdminPassword() {
    return this.keycloakDetails.adminPassword
  }

  override async start(): Promise<StartedKeycloakContainer> {
    return new StartedKeycloakContainer(await super.start(), this)
  }
}

export class StartedKeycloakContainer extends StartedContainer {
  constructor(
    startedTestContainer: StartedTestContainer,
    private readonly keycloakDef: KeycloakContainer
  ) {
    super(startedTestContainer)
  }

  public getOneCXAdminRealm() {
    return this.keycloakDef.getAdminRealm()
  }

  public getOneCXAdminUsername() {
    return this.keycloakDef.getAdminUsername()
  }

  public getOneCXAdminPassword() {
    return this.keycloakDef.getAdminPassword()
  }
}

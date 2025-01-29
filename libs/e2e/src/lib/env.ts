// import fs from 'fs'
// import { StartedNetwork, Network } from 'testcontainers'
// import { StartedContainer } from './containers/container'

// export interface KeycloakRealm {
//   name: string
//   path: string
// }

// export interface KeycloakData extends ContainerData {
//   adminRealm: string
//   adminUsername: string
//   adminPassword: string
//   realms?: KeycloakRealm[]
// }

// export interface DatabaseUser {
//   name: string
//   password: string
// }

// export interface DatabaseDatabaseDefinition {
//   name: string
//   user: string
// }

// export interface DatabaseData extends ContainerData {
//   databaseName: string
//   username: string
//   password: string
//   users?: DatabaseUser[]
//   databases?: DatabaseDatabaseDefinition[]
// }

// export interface ContainerData {
//   image: string
//   name: string
//   alias: string
//   env?: { [key: string]: string }
// }

// export interface EnvData {
//   database?: DatabaseData
//   keycloak?: KeycloakData
//   shell: ContainerData
//   containers: ContainerData[]
// }

// export class Env {
//   startedNetwork: StartedNetwork | undefined
//   containers: Array<StartedContainer> = []
//   async start(configPath: string) {
//     const data = this.readData(configPath)
//     this.startNetworkAndContainers(data)
//   }

//   async teardown() {
//     for (const container of this.containers) {
//       container.stop()
//     }
//   }

//   private async startNetworkAndContainers(data: EnvData) {
//     const network = this.startNetwork()
//     this.startContainers(data)
//   }

//   private async startContainers(data: EnvData) {
//     this.startDatabase(data.database)
//     this.startKeycloak(data.keycloak)
//     this.startShell(data.shell)
//   }

//   private async startDatabase(database: DatabaseData | undefined) {}

//   private async startKeycloak(keycloak: KeycloakData | undefined) {}

//   private async startShell(shell: ContainerData | undefined) {}

//   private async startContainer(container: ContainerData) {}

//   private async startNetwork() {
//     return await new Network().start()
//   }
//   private readData(configPath: string) {
//     return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
//   }
// }

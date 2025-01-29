import { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { Container, StartedContainer } from './container'

export interface DatabaseDetails {
  db: string
  user: string
  password: string
}

export class DatabaseContainer extends Container {
  private databaseDetails: DatabaseDetails = {
    db: 'postgres',
    user: 'postgres',
    password: 'admin',
  }
  constructor(image: string, name: string, alias: string, network: StartedNetwork) {
    super(image, name, alias, network)
  }

  public withDbName(db: string) {
    this.databaseDetails.db = db
    return this
  }

  public withDbUsername(user: string) {
    this.databaseDetails.user = user
    return this
  }

  public withDbUserPassword(password: string) {
    this.databaseDetails.password = password
    return this
  }

  public getDbName() {
    return this.databaseDetails.db
  }

  public getDbUsername() {
    return this.databaseDetails.user
  }

  public getDbUserPassword() {
    return this.databaseDetails.password
  }

  override async start(): Promise<StartedDatabaseContainer> {
    return new StartedDatabaseContainer(await super.start(), this)
  }
}

export class StartedDatabaseContainer extends StartedContainer {
  constructor(
    startedTestContainer: StartedTestContainer,
    private readonly databaseDef: DatabaseContainer
  ) {
    super(startedTestContainer)
  }

  public async getDatabases(): Promise<string[]> {
    const { output, stderr, exitCode } = await this.exec([
      'psql',
      '-U',
      this.databaseDef.getDbUsername(),
      '-tc',
      `SELECT datname FROM pg_database WHERE datistemplate = false`,
    ])

    if (exitCode === 0) {
      const databases = output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      return databases
    } else {
      console.error(`Error listing databases: ${stderr}`)
      return []
    }
  }

  public async doesDatabaseExist(user: string, database: string): Promise<boolean> {
    const { stdout } = await this.exec([
      'psql',
      '-U',
      user,
      '-tc',
      `SELECT 1 FROM pg_database WHERE datname='${database}'`,
    ])
    return stdout.trim() === '1'
  }

  public async createUser(userName: string, userPassword: string): Promise<void> {
    const { exitCode, stderr } = await this.exec([
      'psql',
      '-U',
      this.databaseDef.getDbUsername(),
      '-c',
      `
      DO
      $$
      BEGIN
      CREATE USER ${userName} WITH ENCRYPTED PASSWORD '${userPassword}';
      END
      $$`,
    ])

    if (exitCode !== 0) {
      console.error(`Error creating ${userName} user: ${stderr}`)
    }
  }

  public async createDatabase(dbName: string, userName: string): Promise<void> {
    await this.createDb(dbName, userName)
    await this.grantPrivileges(dbName, userName)
  }

  private async createDb(dbName: string, userName: string): Promise<void> {
    const { exitCode, stderr } = await this.exec([
      'psql',
      '-U',
      this.databaseDef.getDbUsername(),
      '-c',
      `
      CREATE DATABASE ${dbName} with owner ${userName};`,
    ])

    if (exitCode !== 0) {
      console.error(`Error creating ${dbName} database: ${stderr}`)
    }
  }

  private async grantPrivileges(dbName: string, userName: string): Promise<void> {
    const { exitCode, stderr } = await this.exec([
      'psql',
      '-U',
      this.databaseDef.getDbUsername(),
      '-c',
      `
      GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${userName};`,
    ])

    if (exitCode !== 0) {
      console.error(`Error creating ${dbName} database: ${stderr}`)
    }
  }
}

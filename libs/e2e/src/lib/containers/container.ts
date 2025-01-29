import { AbstractStartedContainer, GenericContainer, StartedNetwork, StartedTestContainer } from 'testcontainers'

export class Container extends GenericContainer {
  constructor(
    image: string,
    private onecxName: string,
    private onecxAlias: string,
    private readonly network: StartedNetwork
  ) {
    super(image)
    this.withName(this.onecxName)
      .withNetworkAliases(this.onecxAlias)
      .withNetwork(this.network)
      .withLogConsumer((stream) => {
        stream.on('data', (line) => console.log(`${this.onecxName}: `, line))
        stream.on('err', (line) => console.error(`${this.onecxName}: `, line))
        stream.on('end', () => console.log(`${this.onecxName}: Stream closed`))
      })
  }

  public getName() {
    return this.onecxName
  }

  public getAlias() {
    return this.onecxAlias
  }

  public getExposedPort() {
    return this.exposedPorts
  }

  public getNetwork() {
    return this.network
  }

  public override async start(): Promise<StartedContainer> {
    this.log('Starting container')

    return new StartedContainer(await super.start())
  }

  protected log(message: string) {
    console.log(`${this.onecxName ?? this.imageName}: ${message}`)
  }

  protected error(message: string) {
    console.error(`${this.onecxName ?? this.imageName}: ${message}`)
  }
}

/**
 * Started OneCX container
 */
export class StartedContainer extends AbstractStartedContainer {
  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer)
  }

  protected log(message: string) {
    console.log(`${this.getName()}: ${message}`)
  }

  protected error(message: string) {
    console.error(`${this.getName()}: ${message}`)
  }
}

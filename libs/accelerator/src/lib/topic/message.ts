declare global {
  interface Window {
    onecxMessageId: number
  }
}

window['onecxMessageId'] = 0

export class Message {
  timestamp: number
  id: number

  constructor(public type: string) {
    this.timestamp = window.performance.now()
    this.id = window['onecxMessageId']++
  }
}

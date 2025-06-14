export class FakeLogger {
  public logs: string[] = []
  public warnings: string[] = []
  public errors: string[] = []

  info(message: string) {
    this.logs.push(message)
  }

  warn(message: string) {
    this.warnings.push(message)
  }

  error(message: string) {
    this.errors.push(message)
  }

  clear() {
    this.logs = []
    this.warnings = []
    this.errors = []
  }
}

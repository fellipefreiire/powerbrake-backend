export interface UseCaseError {
  name: string
  message: string
}

export abstract class BaseError extends Error implements UseCaseError {
  constructor(message: string, name: string) {
    super(message)
    this.name = name
  }
}

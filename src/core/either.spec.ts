import { Either, left, right } from './either'

function doSomething(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return right(10)
  }
  return left('error')
}

test('success', () => {
  const result = doSomething(true)

  if (result.isRight()) {
    console.log(result.value)
  }

  expect(result.isRight()).toBe(true)
  expect(result.isLeft()).toBe(false)
})

test('error', () => {
  const result = doSomething(false)

  expect(result.isRight()).toBe(false)
  expect(result.isLeft()).toBe(true)
})

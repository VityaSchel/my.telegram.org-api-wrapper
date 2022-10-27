import { describe, expect, test } from '@jest/globals'
import MyTelegramOrg from './index.mjs'

const myTelegramOrg = new MyTelegramOrg()

describe('Login', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3)
  })
})
/* eslint-disable @typescript-eslint/ban-ts-comment */
import './env'
import { describe, expect, test } from '@jest/globals'
import MyTelegramOrg from '../src/index'
import readlineSync from 'readline-sync'

const myTelegramOrg = new MyTelegramOrg()

if(!process.env.SESSION_TOKEN) {
  let code
  describe('Login flow', () => {
    test('sends code', async () => {
      if(!process.env.PHONE) throw 'Configure process.env.PHONE'
      
      // @ts-ignore-line
      expect(myTelegramOrg.login_random_hash).toBeUndefined()
      await myTelegramOrg.sendCode(process.env.PHONE)
      // @ts-ignore-line
      expect(myTelegramOrg.login_random_hash).not.toBeUndefined()  
    })
    test('logging in', async () => {
      code = readlineSync.question('Code received: ')
      expect(myTelegramOrg.sessionToken).toBeUndefined()
      await myTelegramOrg.loginWithCode(code)
      expect(myTelegramOrg.sessionToken).not.toBeUndefined()
    })
  })
} else {
  myTelegramOrg.sessionToken = process.env.SESSION_TOKEN
  console.warn('Skipping Login flow block, because process.env.SESSION_TOKEN is specified in .env file')
}

describe('Obtain tokens', () => {
  test('get API App ID and API App Hash', async () => {
    const tokens = await myTelegramOrg.obtainTokens()
    expect(tokens.appID).toMatch(/^\d+$/)
    expect(tokens.appHash).toMatch(/^[a-z0-9]+$/)
  })
})
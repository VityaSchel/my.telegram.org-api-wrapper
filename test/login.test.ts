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
    const appSettings = await myTelegramOrg.getSettings()
    expect(appSettings.app.api_id).toMatch(/^\d+$/)
    expect(appSettings.app.api_hash).toMatch(/^[a-z0-9]+$/)
  })
  test('get GCM key', async () => {
    const appSettings = await myTelegramOrg.getSettings()
    expect(appSettings.pushNotifications.gcmKey).toBeInstanceOf(String)
  })
  test('get MTproto configuration', async () => {
    const appSettings = await myTelegramOrg.getSettings()
    const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
    expect(appSettings.mtproto.test.host).toMatch(ipRegex)
    expect(appSettings.mtproto.production.host).toMatch(ipRegex)
    
    expect(appSettings.mtproto.test.dcID).toBeInstanceOf(Number)
    expect(appSettings.mtproto.test.dcID).not.toBe(NaN)
    expect(appSettings.mtproto.test.dcID).not.toBe(Infinity)
    expect(appSettings.mtproto.test.dcID).toBeGreaterThanOrEqual(0)

    expect(appSettings.mtproto.production.dcID).toBeInstanceOf(Number)
    expect(appSettings.mtproto.production.dcID).not.toBe(NaN)
    expect(appSettings.mtproto.production.dcID).not.toBe(Infinity)
    expect(appSettings.mtproto.production.dcID).toBeGreaterThanOrEqual(0)

    expect(appSettings.mtproto.test.publicKey).toBeInstanceOf(String)
    expect(appSettings.mtproto.test.publicKey.length).toBeGreaterThan(0)

    expect(appSettings.mtproto.production.publicKey).toBeInstanceOf(String)
    expect(appSettings.mtproto.production.publicKey.length).toBeGreaterThan(0)
  })
})
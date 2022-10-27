import setCookie from 'set-cookie-parser'
import { parse } from 'node-html-parser'
import cookie from 'cookie'

export const errors = {
  TOO_MANY_TRIES: 'Sorry, too many tries. Please try again later.'
}

export default class MyTelegramOrg {
  /**
   * Step 1/2 when logging in. Send code to the Telegram account with specified phone number.
   * 
   * @param phone - Phone number of account. Must start with `+` sign
   * @returns Error = null with random_hash or error = string if error occured
   */
  async sendCode(phone: string): Promise<{ error: 'too_many_tries' | string } | { error: null, random_hash: string }> {
    const body = new FormData()
    body.append('phone', phone)
    const responseRaw = await fetch('https://my.telegram.org/auth/send_password', {
      method: 'POST',
      body
    })
    const result = await responseRaw.text()
    if(result === errors.TOO_MANY_TRIES) {
      return { error: 'too_many_tries' }
    } else {
      try {
        const response = JSON.parse(result)
        return { error: null, random_hash: response.random_hash }
      } catch(e) {
        console.error('Error while parsing my.telegram.org response body', e)
        return { error: JSON.stringify(e) }
      }
    }
  }

  /**
   * Step 2/2 when logging in. Obtain session token using random_hash from previous step and code received in Telegram.
   * 
   * @param phone - Phone number of account. Must start with `+` sign
   * @param random_hash - `random_hash` parameter returned from sendCode method
   * @param code - Alphanumeric code from Telegram
   * @returns Error = null with sessionToken or error = string if error occured
   */
  async loginWithCode(phone: string, random_hash: string, code: string): Promise<{ error: 'incorrect_code' | 'cookie_not_found' | string } | { error: null, sessionToken: string }> {
    const body = new FormData()
    body.append('phone', phone)
    body.append('random_hash', random_hash)
    body.append('password', code)
    const responseRaw = await fetch('https://my.telegram.org/auth/login', {
      method: 'POST',
      body
    })
    const result = await responseRaw.text()
    if(result === 'Invalid confirmation code!') {
      return { error: 'incorrect_code' }
    } else if (result === 'true') {
      const rawCookiesHeaders = responseRaw.headers.get('Set-Cookie') as string
      const splitCookieHeaders = setCookie.splitCookiesString(rawCookiesHeaders)
      const cookies = setCookie.parse(splitCookieHeaders, { map: true })
      const sessionToken = cookies['stel_token']?.value
      if(!sessionToken) {
        return { error: 'cookie_not_found' }
      } else {
        return { error: null, sessionToken }
      }
    } else {
      return { error: result }
    }
  }

  
  /**
   * Scrape tokens from /apps page. Uses node-html-parser to parse HTML.
   * 
   * @param sessionToken - 
   * @returns 
   */
  obtainTokens(): Promise<{ appID: string, appHash: string }> {
    const responseRaw = await fetch('https://my.telegram.org/apps', {
      method: 'GET',
      headers: {
        'Cookie': cookie.serialize('stel_token', sessionToken)
      }
    })
    const root = parse(await responseRaw.text())
    const appIDEl = root.querySelector('[for=app_id]+div > span > strong')
    if(!appIDEl) throw 'Unable to find app id element'
    const appHashEl = root.querySelector('[for=app_hash]+div > span')
    if(!appHashEl) throw 'Unable to find app hash element'
    return { appID: appIDEl.innerText, appHash: appHashEl.innerText }
  }
}
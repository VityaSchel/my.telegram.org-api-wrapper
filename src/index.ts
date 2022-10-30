import setCookie from 'set-cookie-parser'
import { parse } from 'node-html-parser'
import cookie from 'cookie'
import fetch from 'node-fetch'
import FormData from 'form-data'

export const errors = {
  TOO_MANY_TRIES: 'Sorry, too many tries. Please try again later.'
}

export default class MyTelegramOrg {
  private phone: string
  private login_random_hash: string
  public sessionToken: string

  /**
   * Step 1/2 when logging in. Send code to the Telegram account with specified phone number.
   * 
   * @param phone Phone number of account. Must start with `+` sign
   * @returns Error = null with random_hash or error = string if error occured
   */
  sendCode = async (phone: string): Promise<{ error: 'too_many_tries' | string } | { error: null, random_hash: string }> => {
    this.phone = phone
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
        this.login_random_hash = response.random_hash
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
   * @param code Alphanumeric code from Telegram
   * @param rememberMe Passes "remember": 1 to form data. Sets age of cookie to 355 days, it is unknown if this flag does something else.
   * @returns Error = null with sessionToken or error = string if error occured
   */
  loginWithCode = async (code: string, rememberMe?: boolean): Promise<{ error: 'incorrect_code' | 'cookie_not_found' | string } | { error: null, sessionToken: string }> => {
    const body = new FormData()
    body.append('phone', this.phone)
    body.append('random_hash', this.login_random_hash)
    body.append('password', code)
    rememberMe && body.append('remember', 1)
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
      this.sessionToken = sessionToken
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
   * Scrape app settings from /apps page. Uses node-html-parser to parse HTML.
   * 
   * @returns API App ID and API App hash and a lot more
   */
  getSettings = async (): Promise<{
    app: {
      api_id: string
      api_hash: string
      title: string
      shortName: string
    }
    pushNotifications: {
      gcmKey: string
    },
    mtproto: {
      test: {
        host: string,
        dcID: number,
        publicKey: string
      },
      production: {
        host: string,
        dcID: number,
        publicKey: string
      }
    }
  }> => {
    if(!this.isLoggedIn()) throw new Error('Session token not found. You must be logged in to obtain tokens.')
    const responseRaw = await fetch('https://my.telegram.org/apps', {
      method: 'GET',
      headers: {
        'Cookie': cookie.serialize('stel_token', this.sessionToken)
      }
    })
    
    const root = parse(await responseRaw.text(), { blockTextElements: { pre: false } })
    
    const appIDEl = root.querySelector('[for=app_id]+div > span > strong')
    if(!appIDEl) throw new Error('Unable to find app id element')
    
    const appHashEl = root.querySelector('[for=app_hash]+div > span')
    if(!appHashEl) throw new Error('Unable to find app hash element')
    
    const appTitleEl = root.querySelector('[id=app_title]')
    if(!appTitleEl) throw new Error('Unable to find app title element')
    
    const appShortnameEl = root.querySelector('[id=app_shortname]')
    if(!appShortnameEl) throw new Error('Unable to find app shortname element')

    const appGCMKeyEl = root.querySelector('[id=app_gcm_api_key]')
    if(!appGCMKeyEl) throw new Error('Unable to find GCM key element')

    const mtprotoBlockQuery = 'h3:contains("Available MTProto servers") + '
    const configBlock = (test?: boolean) => `div.form-group:contains("${test ? 'Test' : 'Production'} configuration")`
    const publicKeyBlock = ' + div.form-group pre code'
    const hostAndDc = ' > div >'
    const host = ' span > strong'
    const dcId = ' p'
    
    const testMtprotoHostEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(true)}${hostAndDc}${host}`)
    if(!testMtprotoHostEl) throw new Error('Unable to find mtproto test host element')
    
    const testMtprotoDcEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(true)}${hostAndDc}${dcId}`)
    if(!testMtprotoDcEl) throw new Error('Unable to find mtproto test dc id element')
    
    const testMtprotoPublicKeyEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(true)}${publicKeyBlock}`)
    if(!testMtprotoPublicKeyEl) throw new Error('Unable to find mtproto test public key element')

    const prodMtprotoHostEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(false)}${hostAndDc}${host}`)
    if(!prodMtprotoHostEl) throw new Error('Unable to find mtproto prod host element')
    
    const prodMtprotoDcEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(false)}${hostAndDc}${dcId}`)
    if(!prodMtprotoDcEl) throw new Error('Unable to find mtproto prod dc id element')
    
    const prodMtprotoPublicKeyEl = root.querySelector(`${mtprotoBlockQuery}${configBlock(false)}${publicKeyBlock}`)
    if(!prodMtprotoPublicKeyEl) throw new Error('Unable to find mtproto production public key element')
    
    return { 
      app: {
        api_id: appIDEl.innerText, 
        api_hash: appHashEl.innerText,
        title: appTitleEl.innerText,
        shortName: appShortnameEl.innerText
      },
      pushNotifications: {
        gcmKey: appGCMKeyEl.getAttribute('value')
      },
      mtproto: {
        test: {
          host: testMtprotoHostEl.innerText,
          dcID: Number(testMtprotoDcEl.innerText.substring(3)),
          publicKey: testMtprotoPublicKeyEl.innerText
        },
        production: {
          host: prodMtprotoPublicKeyEl.innerText,
          dcID: Number(prodMtprotoDcEl.innerText.substring(3)),
          publicKey: prodMtprotoPublicKeyEl.innerText
        }
      }
    }
  }

  /**
   * Returns true if user is logged in
   * 
   * @returns Boolean indicating if user is logged in in this class
   */
  isLoggedIn(): Boolean {
    return this.sessionToken !== undefined
  }

  /**
   * Logout user from this class. Does not makes request to /auth/logout because it does not delete session
   */
  logout() {
    this.phone = undefined
    this.login_random_hash = undefined
    this.sessionToken = undefined
  }
}
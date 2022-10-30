# API Reference

Originally written by the great and unique me, for my project [Daivinchik-Assist](https://github.com/VityaSchel/daivinchik-assist/)

<details>

# Авторизация в приложении

Автоматическое получение api_id и api_hash пользователя через скрин скрейпинг сайта https://my.telegram.org/

## 1. Сбор api_id и api_hash

Возможно имеет смысл поставить http-only куки `stel_ln` в значение соответствующее локализации пользователя. Без этой куки не проверялось.

### 1. Сделать POST-запрос к https://my.telegram.org/auth/send_password с телом form-data

Тело:
Формат form-data или x-www-form-urlencoded
phone: Телефон в международном формате (например +79019404698)

Возможные ответы:

200 OK 
`Content-Type: text/html; charset=UTF-8`
```
Sorry, too many tries. Please try again later.
```

200 OK
`Content-Type: application/json; charset=utf-8`
```
{"random_hash":"ajsdjnksanjkd"}
```

### 2. Сделать POST-запрос к https://my.telegram.org/auth/login

Тело:
Формат form-data или x-www-form-urlencoded
phone: Телефон в международном формате (например +79019404698)
random_hash: из ответа полученного в п. 1
password: код от Telegram
remember: 0 или 1 (влияет на Max-Age в куки stel_token)

Возможные ответы:

200 OK
`Content-Type: text/html; charset=UTF-8`
```
Invalid confirmation code!
```

200 OK
`Content-Type: application/json; charset=utf-8`
```
true
```

Если код правильный, приходит заголовок `Set-Cookie: stel_token=оченьдлинныебуквыцифры; path=/; samesite=None; secure; HttpOnly`

### 3. Сделать GET-запрос к https://my.telegram.org/apps

На этой странице и нужно искать api_id и api_hash. 

#### 3.1 Если приложение уже создано

Используйте селекторы

`[for=app_id]+div > span > strong` -> innerText для API_ID 
`[for=app_hash]+div > span` -> innerText для API_HASH

#### 3.2 Если приложение не создано

а вот тут я и сам хз что делать, удалить то нельзя, а значит для тестирования придется покупать новый аккаунт :)

## 2. Авторизоваться через MTProto как обычно
</details>

<!-- TSDOC_START -->

## :wrench: Constants

- [errors](#gear-errors)

### :gear: errors

| Constant | Type |
| ---------- | ---------- |
| `errors` | `{ TOO_MANY_TRIES: string; }` |


## :factory: default



### Constructors

`public`



### Methods

- [sendCode](#gear-sendcode)
- [loginWithCode](#gear-loginwithcode)
- [getSettings](#gear-getsettings)
- [isLoggedIn](#gear-isloggedin)
- [logout](#gear-logout)

#### :gear: sendCode

Step 1/2 when logging in. Send code to the Telegram account with specified phone number.

| Method | Type |
| ---------- | ---------- |
| `sendCode` | `(phone: string) => Promise<{ error: string; } or { error: null; random_hash: string; }>` |

Parameters:

* `phone`: Phone number of account. Must start with `+` sign


#### :gear: loginWithCode

Step 2/2 when logging in. Obtain session token using random_hash from previous step and code received in Telegram.

| Method | Type |
| ---------- | ---------- |
| `loginWithCode` | `(code: string, rememberMe?: boolean) => Promise<{ error: string; } or { error: null; sessionToken: string; }>` |

Parameters:

* `code`: Alphanumeric code from Telegram
* `rememberMe`: Passes "remember": 1 to form data. Sets age of cookie to 355 days, it is unknown if this flag does something else.


#### :gear: getSettings

Scrape app settings from /apps page. Uses node-html-parser to parse HTML.

| Method | Type |
| ---------- | ---------- |
| `getSettings` | `() => Promise<{ app: { api_id: string; api_hash: string; title: string; shortName: string; }; pushNotifications: { gcmKey: string; }; mtproto: { test: { host: string; dcID: number; publicKey: string; }; production: { ...; }; }; }>` |

#### :gear: isLoggedIn

Returns true if user is logged in

| Method | Type |
| ---------- | ---------- |
| `isLoggedIn` | `() => Boolean` |

#### :gear: logout

Logout user from this class. Does not makes request to /auth/logout because it does not delete session

| Method | Type |
| ---------- | ---------- |
| `logout` | `() => void` |


<!-- TSDOC_END -->
# [my.telegram.org](https://my.telegram.org) API wrapper

TypeScript supported!

Tested with Jest.

## Features

Do anything you usually do at my.telegram.org but hacker-stylish (hackerlish-like). From JS. From command line. Use it as CLI. Use it in your cron. Embed it in your paid software and tell your coworkers you made this library yourself because it's just 1 KB gzipped!!!

## Motivation

Ask your mama

## Installation

```
npm i my.telegram.org-api-wrapper
```

```
yarn add my.telegram.org-api-wrapper
```

## Usage

```ts
import MyTelegramOrg from 'my.telegram.org-api-wrapper'

const myTelegramOrg = new MyTelegramOrg()
myTelegramOrg
```

### API Reference

[Read API reference here](./API.md)

## Behind the scenes

I wrote most of the code myself, but then I found MadelineProto and stole `createApp` method from [there](https://github.com/danog/MadelineProto/blob/25a509ff2e246983823297367eee86bc70c6e2b5/src/danog/MadelineProto/MyTelegramOrgWrapper.php), so credits goes to the author. Anyway, code is written by me so license is MIT (if you really care about licenses when abusing private API).

## Donate. Do it right now. ⤵️

[hloth.dev/donate](https://hloth.dev/donate)
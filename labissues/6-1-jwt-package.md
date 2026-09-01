# jwt package lab issues

## the `.env` key-injection commands only work in bash, not zsh

compatibility: step 2 injects the pem files into `.env` with

```
echo "PRIVATE_KEY=\"$(awk '{printf "%s\\n", $0}' ec_private.pem)\"" >> .env
```

the awk half is correct — it emits the key as one line with literal `\n` separators. the problem is `echo`. bash's builtin `echo` prints backslashes verbatim, but zsh's expands escape sequences by default, so every `\n` awk just inserted is turned back into a real newline on the way into `.env`. same command, same awk, different result:

```
zsh:  lines produced:        5
bash: lines produced:        1
```

zsh is the default shell on macos, so this is the common case. it does not fail loudly — `.env` gets written, and dotenv's multiline support means `yarn sign` may even work — but the file is not the single-line form the lab describes, and the values break as soon as anything re-parses or re-quotes them

workaround: use `printf` instead of `echo`, which never interprets escapes in its argument

```sh
printf 'PRIVATE_KEY="%s"\n' "$(awk '{printf "%s\\n", $0}' ec_private.pem)" >> .env
printf 'PUBLIC_KEY="%s"\n'  "$(awk '{printf "%s\\n", $0}' ec_public.pem)"  >> .env
```

`echo -E` also works in zsh, but `printf` is the portable fix

## `expiresIn: process.env.EXPIRATION` silently issues a 3-second token

compatibility: `.env` sets `EXPIRATION="3600"` and `sign.js` passes it straight through as `expiresIn: process.env.EXPIRATION`. env vars are always strings, and jsonwebtoken treats a string `expiresIn` as a *timespan* — it hands it to `ms()`, which reads a bare number as **milliseconds**. so `"3600"` means 3600ms, and the `exp` claim lands 3 seconds after `iat`, not an hour

```
expiresIn="3600"   lifetime = 3 seconds
expiresIn=3600     lifetime = 3600 seconds
expiresIn="1h"     lifetime = 3600 seconds
```

nothing errors. `yarn sign` succeeds and `yarn verify` succeeds too, because `clockTolerance: 5` in `verify.js` is wide enough to cover the 3-second lifetime. the token looks fine right up until you use it, and then it is already expired

workaround: coerce it, so the numeric-seconds branch is taken

```js
expiresIn: Number(process.env.EXPIRATION),
```

or set `EXPIRATION="1h"` in `.env` and leave `sign.js` alone — a timespan string with units is unambiguous. the numeric form is the trap

## step 5 sends your token to a third-party site

not a bug, but worth flagging: the lab says to paste `token.txt` into jwt.io. jwt.io decodes in the browser, but the payload here carries a real name and email, and pasting signed tokens into web tools is a habit worth not building. the same view is one command away locally:

```sh
node -e "const t=require('fs').readFileSync('token.txt','utf8').trim().split('.');
const d=s=>JSON.parse(Buffer.from(s,'base64url'));
console.log(d(t[0]), d(t[1]))"
```

```
{ alg: 'ES256', typ: 'JWT' } {
  account_id: '123', user_id: 'abc', email: '...', name: '...',
  tzone: 'America/Denver', permissions: 'user',
  iat: 1788277328, exp: 1788280928,
  aud: 'csci32-frontend', iss: 'csci32-backend'
}
```

the `aud`, `iss`, `iat` and `exp` claims added at signing time are visible either way, which is the point of the step

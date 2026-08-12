# Privacy policy

Last updated: 2026-08-12

This policy describes what is true for Gender Diary as shipped. Each surface is
covered from the day it is published, and not before.

## Scope

Gender Diary has separate surfaces with different observers:

- The hosted web app at `app.genderdiary.barankiewicz.dev`, once hosting is
  published.
- Distribution channels for Android releases (Google Play, F-Droid, direct APK)
  once Android builds are published.
- Whatever destination you pick for a backup file you export yourself.

One sentence cannot describe all three safely, so this policy keeps them
separate.

## Hosted web app

The web host can observe normal web-server metadata when the app is loaded or
updated, for example:

- Source IP address.
- Request time.
- Requested paths and file sizes.
- User-Agent and referrer headers sent by the browser.

The host does not receive accounts, profile identifiers or journal uploads.
Journal content is stored in browser storage on the device.

## Android store delivery

Android builds are distributed through channels that have their own telemetry
and account policies. Store operators can observe install and update events
under their own terms.

Inside the app, journal content stays on the device. It is not sent to a project
server as part of normal use.

## Backup files, and wherever you put them

When you export a backup, you choose where the file goes.

If you keep that file with a document provider or cloud drive, that provider can
observe file metadata such as filename, timestamp, size and account-level access
logs.

An encrypted backup cannot be read without its password. Nobody, including this
app, can recover that password or read the file without it.

A plain CSV or JSON export is a different thing: it is not encrypted, and anyone
who gets the file can read the whole journal. The app says so at the moment of
export, and this policy says so too.

## What this project does not claim

- Not that a hosted app makes no network requests. It has to fetch itself.
- Not that distribution channels collect nothing.
- Not that a forgotten journal passphrase or backup password can be recovered.
  Neither can.

## Support and security boundaries

Neither support nor security triage requires your private journal data.

- Support policy: `SUPPORT.md`
- Security disclosure process: `SECURITY.md`

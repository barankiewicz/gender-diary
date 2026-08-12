# Privacy policy

Last updated: 2026-08-12

This policy describes what is true for Gender Diary as shipped today.

## Scope

Gender Diary has separate surfaces with different observers:

- Hosted web app at `app.genderdiary.barankiewicz.dev`.
- Distribution channels for Android releases (Google Play, F-Droid, direct APK)
  once Android builds are published.
- Optional archive storage destinations chosen by the user.

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

Inside the app, the data model stays local-first. Journal content is not sent
to a project server as part of normal use.

## Optional archive destinations

When you export an encrypted Archive, you choose where the file goes.

If you store that file with a document provider or cloud drive, that provider
can observe file metadata such as filename, timestamp, size and account-level
access logs.

Without the archive password, the archive payload is unreadable.

## What this project does not claim

- We do not claim that a hosted app makes no network requests.
- We do not claim that distribution channels collect nothing.
- We do not claim recovery for forgotten passphrases or archive passwords.

## Support and security boundaries

Support and security triage never require your private journal data.

- Support policy: `SUPPORT.md`
- Security disclosure process: `SECURITY.md`

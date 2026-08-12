# Provisioning

The parts of shipping this app that a person has to do: DNS records, a hosting
account, a store registration, a signing key. `scripts/provision.sh` walks them
one at a time, says what each value is for before asking for it, and writes each
one where it belongs. Read it before running it:

```
DRY_RUN=1 scripts/provision.sh     # performs nothing, describes every step
scripts/provision.sh               # for real
```

It is re-runnable and skips what is already done, which is the normal case
rather than the exception: a Google Play registration has to be verified before
it can hold an app, so a run that finishes everything in one sitting is
unlikely.

## Where a captured value goes

Nothing is written into this repository. It is public, and half of what gets
captured is a credential.

Secrets go to the `release` environment on GitHub, which
`.github/workflows/release.yml` declares and no other workflow does. That is the
point of an environment rather than repository-wide secrets: `ci.yml` runs on
pull requests, including from forks, and is given no secret at all. A signing key
in a repository-wide secret would be readable from a job that anyone can start.

| Name | Kind | Read by |
| --- | --- | --- |
| `VPS_HOST` | secret | ticket 05, deploying the Journal |
| `VPS_PORT` | secret | ticket 05 |
| `VPS_USER` | secret | ticket 05 |
| `VPS_DEPLOY_KEY` | secret | ticket 05, the CI-only ssh private key |
| `PLAY_SERVICE_ACCOUNT_JSON` | secret | ticket 18, delivering the App Bundle |
| `ANDROID_KEYSTORE_BASE64` | secret | ticket 18, the keystore itself |
| `ANDROID_KEYSTORE_PASSWORD` | secret | ticket 18 |
| `ANDROID_KEY_ALIAS` | variable | ticket 18 |

Everything that is not a secret goes to `~/.local/state/gender-diary/`
(`$XDG_STATE_HOME` if you set it), which also holds the two files that must not
be in a repository:

- `provisioning.env` - which stages finished, plus hostnames and usernames.
- `provisioning.log` - a transcript of the runs. Names of things, no values.
- `upload-keystore.p12` - the Android signing key, mode 600.
- `vps-ci-deploy-key` - the private half of the CI deploy key, mode 600.

The keystore password is not stored anywhere the wizard can read it back. GitHub
secrets are write-only, so your own password manager is the only copy, and the
wizard asks you for the password rather than generating one so that copy exists
before the key does.

## The signing key, and what depends on not losing it

One key signs every release build. For the APK channels - the release APK on
GitHub Releases, which Obtainium follows, and F-Droid - it is the app's
identity, and an installed copy will not accept an update signed by a different
one. Losing it means every user reinstalls and restores from an Archive. For
Play it is the upload key, which Google can reset at the cost of a support round
trip.

So the keystore file wants an offline backup, and the password wants to be in a
password manager before the key exists.

## What the wizard does not do

- **nginx, TLS and the release directories on the VPS** belong to ticket 05. The
  wizard arranges the DNS record certbot needs and the key CI logs in with, and
  stops there.
- **Building and signing the Android artifacts** belongs to ticket 18. The
  wizard generates the keystore and puts it in the `release` environment; the
  three names in the table above are the whole seam between them.
- **Anything to do with the landing site.** It has its own origin, its own
  hosting account and its own deployment credentials, which nothing here can
  reach (ADR-0019), it is already deployed, and it keeps its own wizard for that
  work. This script is the app's.
- **Submitting to F-Droid** waits for ticket 18: F-Droid rebuilds the published
  source itself, so a request filed before the metadata and the reproducibility
  result exist gets closed. The last stage checks for them and records nothing
  until the request is actually filed.

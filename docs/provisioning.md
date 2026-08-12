# Provisioning

The parts of shipping this app that a person has to do: a DNS record, deployment
access, a store registration, a signing key. This file is the record of what
those steps produce and what reads it, which is the half that the pipeline and
the later tickets depend on.

The wizard that walks the steps themselves is untracked, because it is specific
to one operator's machine rather than to this app: it reads the VPS address out
of an ssh alias, names a deploy user, and keeps its own progress in a state
directory. Ask whoever holds it, or read the steps below and do them by hand -
nothing here needs the script to have run, only the values to be in place.

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
  reach (ADR-0019). It is already deployed, and it keeps its own setup path.
- **Submitting to F-Droid** waits for ticket 18: F-Droid rebuilds the published
  source itself, so a request filed before the metadata and the reproducibility
  result exist gets closed.

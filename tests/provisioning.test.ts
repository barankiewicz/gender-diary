/* The provisioning wizard (phase 2 ticket 07). It is a bash script a human runs
   by hand once, so almost nothing about it belongs in an automated test: the
   value of a stage is whether the instructions are true, and only a person
   standing in the Play Console can say.

   Four things do belong here, because they are the ones that rot without anyone
   noticing until provisioning night:

   - The three decided identities (ticket 01, ADR-0019) are read out of the ADR
     rather than copied into the script. A wizard carrying its own copy of the
     Journal origin is a wizard that can walk you through provisioning the wrong
     one, and that origin is the value that cannot be moved afterwards.
   - A dry run walks every stage. That is what makes the script safe to read
     before running it for real, and it is how the two properties below are
     checked at all.
   - A second run skips exactly the stages the first one recorded. Provisioning
     spans days (a Play account has to be verified), so a re-run is the normal
     case, not the exception. A stage records itself only on evidence that its
     work happened, so the stages a dry run cannot evidence are walked again -
     which is the behaviour worth pinning, since the alternative is a stage
     ticked on nothing and skipped forever.
   - Nothing typed at a hidden prompt reaches the terminal, the transcript or
     the state file. The repository is public and the values are a signing key
     and hosting credentials.

   The dry run replaces every hidden prompt it was given no input for with a
   value prefixed `dry-run-secret-`, which is what the leak check looks for. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = 'scripts/provision.sh';
const source = readFileSync(join(root, script), 'utf8');
const TOTAL_STAGES = 9;

function dryRun(stateDir: string) {
  return spawnSync('bash', [script], {
    cwd: root,
    encoding: 'utf8',
    /* No stdin at all, which is what makes the run finish: every prompt reads
       end-of-file. A visible prompt then comes back empty, exactly as it would
       in a real run, and each stage's own default applies; a hidden one falls
       back to the `dry-run-secret-` value the leak check hunts for. */
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DRY_RUN: '1', GENDER_DIARY_STATE_DIR: stateDir },
    timeout: 120_000
  });
}

function stateFiles(dir: string) {
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isFile())
    .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
}

describe('the provisioning wizard, dry run', () => {
  let first: ReturnType<typeof dryRun>;
  let stateDir: string;

  beforeAll(() => {
    stateDir = mkdtempSync(join(tmpdir(), 'gd-provision-'));
    first = dryRun(stateDir);
  });

  it('walks every stage and exits cleanly', () => {
    expect(first.stderr).toBe('');
    expect(first.status).toBe(0);
    for (let n = 1; n <= TOTAL_STAGES; n += 1) {
      expect(first.stdout).toContain(`Stage ${n}/${TOTAL_STAGES}`);
    }
  });

  it('performs nothing, and says what it would have performed instead', () => {
    expect(first.stdout).toContain('would open');
    expect(first.stdout).toContain('would set');
    expect(first.stdout).toContain('would run');
  });

  it('reads the decided identities out of ADR-0019 rather than carrying a copy', () => {
    expect(first.stdout).toContain('app.genderdiary.barankiewicz.dev');
    expect(first.stdout).toContain('genderdiary.barankiewicz.dev');
    expect(first.stdout).toContain('dev.barankiewicz.genderdiary');
    /* The point of the two above: the script's own text has neither. */
    expect(source).not.toContain('genderdiary.barankiewicz.dev');
    expect(source).not.toContain('dev.barankiewicz.genderdiary');
  });

  it('keeps a hidden prompt out of the terminal and out of every file it writes', () => {
    expect(first.stdout).not.toContain('dry-run-secret-');
    expect(first.stderr).not.toContain('dry-run-secret-');
    for (const file of stateFiles(stateDir)) {
      expect(file.text, `${file.name} holds a value from a hidden prompt`).not.toContain(
        'dry-run-secret-'
      );
    }
  });

  it('persists no secret-shaped key, whatever the value', () => {
    const keys = readFileSync(join(stateDir, 'provisioning.env'), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('=')[0]);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((key) => /PASSWORD|SECRET|PRIVATE|BASE64|_JSON/.test(key))).toEqual([]);
  });

  it('skips exactly the stages the first run recorded, and no others', () => {
    /* Derived from the state file rather than hardcoded, because which stages
       can finish depends on what the run could evidence: a dry run creates no
       keystore and no ssh key, so the stages gated on those correctly decline to
       record themselves. The invariant is the equality, not the number. */
    const recorded = readFileSync(join(stateDir, 'provisioning.env'), 'utf8')
      .split('\n')
      .filter((line) => /=\d{4}-\d{2}-\d{2}T/.test(line));
    expect(recorded.length).toBeGreaterThan(4);
    expect(recorded.length).toBeLessThanOrEqual(TOTAL_STAGES);

    const second = dryRun(stateDir);
    expect(second.status).toBe(0);
    const skipped = second.stdout.match(/Stage \d+\/\d+ · .*\(already done/g) ?? [];
    const walked = second.stdout.match(/▸ Stage \d+\/\d+ ·/g) ?? [];
    expect(skipped).toHaveLength(recorded.length);
    /* Every stage is accounted for as one or the other, so a skip cannot quietly
       swallow a stage and a re-walk cannot double-count one. */
    expect(skipped.length + walked.length).toBe(TOTAL_STAGES);
    /* And a stage that recorded nothing is walked again rather than lost. */
    expect(second.stdout).toContain(`Stage ${TOTAL_STAGES}/${TOTAL_STAGES}`);
  });
});

describe('the seam the later tickets read', () => {
  it('documents every secret and variable name it sets', () => {
    /* Call sites only. The helpers' own doc comments spell the parameter NAME. */
    const names = [...source.matchAll(/^\s*set_env_(?:secret|var) ([A-Z][A-Z0-9_]+) /gm)].map(
      (m) => m[1]
    );
    expect(names.length).toBeGreaterThan(0);
    const doc = readFileSync(join(root, 'docs/provisioning.md'), 'utf8');
    for (const name of new Set(names)) {
      expect(doc, `${name} is set but not written down`).toContain(name);
    }
  });
});

import { runHostInputChecks } from '../util/host-input';

describe('host input and native virtual layers', () => {
  it('keeps scoped input, cancellation, component drags and first-frame composition consistent', async () => {
    const checks = await runHostInputChecks();
    expect(checks.length).toBeGreaterThan(40);
    checks.forEach(check => expect(check.pass).toBe(true));
  });
});

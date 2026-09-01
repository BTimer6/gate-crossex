import { describe, expect, it } from 'vitest';
import { AccessAuth, safeReturnPath } from './access-auth.js';

describe('AccessAuth', () => {
  it('compares passwords without exposing them and expires server-side sessions', () => {
    let now = 1_000;
    const auth = new AccessAuth('correct horse battery staple', false, () => now);
    expect(auth.login('incorrect horse battery staple')).toBeNull();
    const token = auth.login('correct horse battery staple');
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(auth.isAuthenticated(`other=value; gct_session=${token}`)).toBe(true);
    now += 12 * 60 * 60_000 + 1;
    expect(auth.isAuthenticated(`gct_session=${token}`)).toBe(false);
  });

  it('only permits same-site relative return paths', () => {
    expect(safeReturnPath('/portfolio?asset=BTC')).toBe('/portfolio?asset=BTC');
    expect(safeReturnPath('https://attacker.example')).toBe('/');
    expect(safeReturnPath('//attacker.example')).toBe('/');
    expect(safeReturnPath('/auth/login')).toBe('/');
  });
});

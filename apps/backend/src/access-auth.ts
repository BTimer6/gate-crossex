import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_LIFETIME_MS = 12 * 60 * 60_000;
const MAX_SESSIONS = 64;

interface AccessSession {
  expiresAt: number;
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith('/auth/')) return '/';
  return value.slice(0, 2_048);
}

export class AccessAuth {
  readonly enabled: boolean;
  readonly cookieName: string;
  private readonly passwordDigest: Buffer | null;
  private readonly sessions = new Map<string, AccessSession>();

  constructor(password: string | null, private readonly secureCookie: boolean, private readonly now = Date.now) {
    this.enabled = password !== null;
    this.passwordDigest = password === null ? null : digest(password);
    this.cookieName = secureCookie ? '__Host-gct_session' : 'gct_session';
  }

  login(password: string): string | null {
    if (!this.passwordDigest || !timingSafeEqual(digest(password), this.passwordDigest)) return null;
    this.prune();
    while (this.sessions.size >= MAX_SESSIONS) {
      const oldest = this.sessions.keys().next().value as string | undefined;
      if (!oldest) break;
      this.sessions.delete(oldest);
    }
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(token, { expiresAt: this.now() + SESSION_LIFETIME_MS });
    return token;
  }

  isAuthenticated(cookieHeader: string | undefined): boolean {
    if (!this.enabled) return true;
    const token = this.readCookie(cookieHeader);
    if (!token) return false;
    const session = this.sessions.get(token);
    if (!session || session.expiresAt <= this.now()) {
      if (session) this.sessions.delete(token);
      return false;
    }
    return true;
  }

  logout(cookieHeader: string | undefined): void {
    const token = this.readCookie(cookieHeader);
    if (token) this.sessions.delete(token);
  }

  sessionCookie(token: string): string {
    return `${this.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME_MS / 1_000}${this.secureCookie ? '; Secure' : ''}`;
  }

  expiredCookie(): string {
    return `${this.cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${this.secureCookie ? '; Secure' : ''}`;
  }

  private readCookie(header: string | undefined): string | null {
    if (!header) return null;
    for (const part of header.split(';')) {
      const [name, ...valueParts] = part.trim().split('=');
      if (name === this.cookieName) return valueParts.join('=') || null;
    }
    return null;
  }

  private prune(): void {
    const now = this.now();
    for (const [token, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(token);
    }
  }
}

export function renderAccessLoginPage(returnPath: string, invalidPassword = false): { html: string; csp: string } {
  const message = invalidPassword
    ? '<p class="error" role="alert">密码不正确，请重试。 / Incorrect password. Please try again.</p>'
    : '';
  return {
    csp: "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    html: `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>登录 · Gate CrossEx</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#07110f;color:#edf7f3}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#12352d 0,#07110f 55%)}
    main{width:min(100%,420px);padding:32px;border:1px solid #29483f;border-radius:18px;background:#0d1c18;box-shadow:0 24px 80px #0008}
    .eyebrow{margin:0 0 8px;color:#61d7af;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}h1{margin:0 0 8px;font-size:1.8rem}
    .hint{margin:0 0 24px;color:#a9bbb5;line-height:1.55}.error{padding:12px;border-radius:9px;background:#4b1e24;color:#ffd8dc;font-size:.9rem}
    label{display:block;margin-bottom:8px;font-weight:650}input{width:100%;padding:13px 14px;border:1px solid #3a5a51;border-radius:10px;background:#07110f;color:#fff;font:inherit;outline:none}
    input:focus{border-color:#61d7af;box-shadow:0 0 0 3px #61d7af26}button{width:100%;margin-top:16px;padding:13px;border:0;border-radius:10px;background:#55d3a8;color:#052019;font:inherit;font-weight:800;cursor:pointer}
    small{display:block;margin-top:20px;color:#789087;line-height:1.5}
  </style>
</head>
<body><main>
  <p class="eyebrow">Private terminal</p><h1>Gate CrossEx</h1>
  <p class="hint">请输入服务器访问密码。<br>Enter the server access password.</p>
  ${message}
  <form method="post" action="/auth/login">
    <input type="hidden" name="next" value="${escapeHtml(returnPath)}">
    <label for="password">访问密码 / Password</label>
    <input id="password" name="password" type="password" minlength="12" maxlength="256" autocomplete="current-password" autofocus required>
    <button type="submit">登录 / Sign in</button>
  </form>
  <small>会话将在 12 小时后失效，服务重启后需要重新登录。</small>
</main></body></html>`,
  };
}

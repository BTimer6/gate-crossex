import { describe, expect, it } from 'vitest';
import { translate } from './i18n.js';

describe('English and Chinese translations', () => {
  it.each([
    ['en', 'More', 'More'],
    ['zh', 'More', '更多'],
    ['zh', 'Best ask', '最优卖价'],
    ['zh', 'ADL indicator', 'ADL 指标'],
    ['zh', 'Manage and switch accounts', '管理和切换账户'],
    ['zh', 'Sign in with Gate API credentials', '使用 Gate API 密钥登录'],
    ['zh', 'Open secure credential setup', '打开 Gate API 密钥设置'],
  ] as const)('translates %s %s', (language, key, expected) => {
    expect(translate(language, key)).toBe(expected);
  });
});

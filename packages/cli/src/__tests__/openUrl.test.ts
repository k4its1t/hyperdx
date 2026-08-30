import { describe, expect, it } from '@jest/globals';

import { getOpenUrlCommand } from '@/utils/openUrl';

const dangerousUrl =
  'https://example.com/$(touch%20tmp-pwned)?q=`id`&next="quoted"';

describe('getOpenUrlCommand', () => {
  it.each([
    ['darwin', 'open', [dangerousUrl]],
    ['linux', 'xdg-open', [dangerousUrl]],
    ['win32', 'rundll32.exe', ['url.dll,FileProtocolHandler', dangerousUrl]],
  ] as const)(
    'passes an untrusted URL as one argv value on %s',
    (platform, executable, args) => {
      expect(getOpenUrlCommand(dangerousUrl, platform)).toEqual({
        executable,
        args,
      });
    },
  );

  it.each([
    'file:///tmp/example',
    'javascript:alert(1)',
    'data:text/plain,test',
  ])('rejects the non-HTTP URL %s', url => {
    expect(getOpenUrlCommand(url, 'linux')).toBeNull();
  });
});

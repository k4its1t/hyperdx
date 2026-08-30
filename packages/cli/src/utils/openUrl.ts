import { execFile } from 'child_process';

type OpenUrlCommand = {
  executable: string;
  args: string[];
};

export function getOpenUrlCommand(
  url: string,
  platform: NodeJS.Platform = process.platform,
): OpenUrlCommand | null {
  try {
    const protocol = new URL(url).protocol;
    if (protocol !== 'http:' && protocol !== 'https:') return null;
  } catch {
    return null;
  }

  if (platform === 'darwin') return { executable: 'open', args: [url] };
  if (platform === 'win32') {
    return {
      executable: 'rundll32.exe',
      args: ['url.dll,FileProtocolHandler', url],
    };
  }
  return { executable: 'xdg-open', args: [url] };
}

/**
 * Open a URL in the user's default browser.
 *
 * Uses platform-specific commands:
 *  - macOS:   `open <url>`
 *  - Linux:   `xdg-open <url>`
 *  - Windows: `rundll32.exe url.dll,FileProtocolHandler <url>`
 *
 * Fire-and-forget — errors are silently ignored so the TUI
 * is never disrupted if the browser fails to launch.
 */
export function openUrl(url: string): void {
  const command = getOpenUrlCommand(url);
  if (!command) return;

  execFile(command.executable, command.args, () => {
    // Intentionally swallow errors — headless servers, missing
    // display, etc. should not crash the TUI.
  });
}

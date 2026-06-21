/**
 * System credential vault abstraction.
 * Stores/retrieves the OAuth refresh token using the OS native vault.
 *
 * - macOS   : security(1) — Keychain
 * - Windows : PowerShell CredWrite/CredRead P/Invoke (Windows Credential Manager)
 * - Linux   : secret-tool(1) — libsecret / GNOME Keyring
 *
 * If no vault binary is available, loadRefreshToken returns null (forces login)
 * and saveRefreshToken is a no-op with a stderr warning.
 * A plaintext file is NEVER written.
 *
 * Uses ONLY Node built-ins: node:child_process, node:process, node:buffer.
 */

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const SERVICE = 'tora-deployer';
const ACCOUNT = 'refresh-token';

/* ------------------------------------------------------------------ */
/* Platform detection                                                   */
/* ------------------------------------------------------------------ */

function platform() {
  return process.platform; // 'darwin' | 'win32' | 'linux'
}

/**
 * Returns true if a command exists in PATH (no output, just a check).
 * @param {string} cmd
 */
function commandExists(cmd) {
  try {
    if (platform() === 'win32') {
      execFileSync('where', [cmd], { stdio: 'pipe' });
    } else {
      execFileSync('which', [cmd], { stdio: 'pipe' });
    }
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* macOS — Keychain via security(1)                                    */
/* ------------------------------------------------------------------ */

function macSave(token) {
  // Delete any existing entry first (ignore errors)
  try {
    execFileSync('security', [
      'delete-generic-password',
      '-s', SERVICE,
      '-a', ACCOUNT,
    ], { stdio: 'pipe' });
  } catch { /* ok if not found */ }

  execFileSync('security', [
    'add-generic-password',
    '-s', SERVICE,
    '-a', ACCOUNT,
    '-w', token,
    '-U',
  ], { stdio: 'pipe' });
}

function macLoad() {
  try {
    const out = execFileSync('security', [
      'find-generic-password',
      '-s', SERVICE,
      '-a', ACCOUNT,
      '-w',
    ], { stdio: 'pipe' });
    return out.toString('utf8').trim() || null;
  } catch {
    return null;
  }
}

function macClear() {
  try {
    execFileSync('security', [
      'delete-generic-password',
      '-s', SERVICE,
      '-a', ACCOUNT,
    ], { stdio: 'pipe' });
  } catch { /* ok if not found */ }
}

/* ------------------------------------------------------------------ */
/* Windows — PowerShell CredWrite/CredRead P/Invoke                    */
/*                                                                      */
/* Both save and load use the same P/Invoke wrapper so the token is    */
/* stored and retrieved intact regardless of spaces, Unicode, or any   */
/* other content.  The script is passed via -EncodedCommand (base64)   */
/* to avoid any shell-quoting or here-string column-0 constraints.     */
/* ------------------------------------------------------------------ */

// Windows credential target name
const WIN_TARGET = `${SERVICE}:${ACCOUNT}`;

/**
 * Encode a PowerShell script string for use with powershell -EncodedCommand.
 * PowerShell expects UTF-16LE base64.
 * @param {string} script
 * @returns {string} base64url string
 */
function encodePsCommand(script) {
  // UTF-16LE encoding (what PowerShell -EncodedCommand expects)
  const buf = Buffer.from(script, 'utf16le');
  return buf.toString('base64');
}

/**
 * Shared P/Invoke type definition for Windows Credential Manager.
 * Returned as a string to be embedded in PowerShell scripts.
 */
function winCredTypeDef() {
  return `
Add-Type -TypeDefinition '
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinCred {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public int Flags;
    public int Type;
    public string TargetName;
    public string Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public int CredentialBlobSize;
    public IntPtr CredentialBlob;
    public int Persist;
    public int AttributeCount;
    public IntPtr Attributes;
    public string TargetAlias;
    public string UserName;
  }
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern bool CredWrite(ref CREDENTIAL credential, int flags);
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
  [DllImport("advapi32.dll")]
  public static extern void CredFree(IntPtr cred);
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern bool CredDelete(string target, int type, int flags);
}
' -ErrorAction SilentlyContinue;`.trim();
}

function winSave(token) {
  // Encode the token as UTF-16LE bytes for CredentialBlob (standard for Windows cred store)
  // Pass the token via a separate -EncodedCommand so no quoting issues
  const tokenB64 = Buffer.from(token, 'utf16le').toString('base64');
  const script = `
${winCredTypeDef()}
$tokenBytes = [System.Convert]::FromBase64String('${tokenB64}');
$cred = New-Object WinCred+CREDENTIAL;
$cred.Type = 1;
$cred.TargetName = '${WIN_TARGET}';
$cred.UserName = '${ACCOUNT}';
$cred.CredentialBlobSize = $tokenBytes.Length;
$cred.Persist = 2;
$ptr = [System.Runtime.InteropServices.Marshal]::AllocHGlobal($tokenBytes.Length);
try {
  [System.Runtime.InteropServices.Marshal]::Copy($tokenBytes, 0, $ptr, $tokenBytes.Length);
  $cred.CredentialBlob = $ptr;
  $ok = [WinCred]::CredWrite([ref]$cred, 0);
  if (-not $ok) { throw [System.ComponentModel.Win32Exception]::new([System.Runtime.InteropServices.Marshal]::GetLastWin32Error()) }
} finally {
  [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr);
}
`.trim();

  execFileSync('powershell', [
    '-NoProfile', '-NonInteractive', '-EncodedCommand', encodePsCommand(script),
  ], { stdio: 'pipe' });
}

function winLoad() {
  try {
    const script = `
${winCredTypeDef()}
$ptr = [IntPtr]::Zero;
if ([WinCred]::CredRead('${WIN_TARGET}', 1, 0, [ref]$ptr)) {
  $cred = [System.Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [Type][WinCred+CREDENTIAL]);
  $bytes = New-Object byte[] $cred.CredentialBlobSize;
  [System.Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $bytes, 0, $cred.CredentialBlobSize);
  [WinCred]::CredFree($ptr);
  [System.Text.Encoding]::Unicode.GetString($bytes)
}
`.trim();

    const out = execFileSync('powershell', [
      '-NoProfile', '-NonInteractive', '-EncodedCommand', encodePsCommand(script),
    ], { stdio: 'pipe' });
    const value = out.toString('utf8').trim();
    return value || null;
  } catch {
    return null;
  }
}

function winClear() {
  try {
    execFileSync('cmdkey', [`/delete:${WIN_TARGET}`], { stdio: 'pipe' });
  } catch { /* ok if not found */ }
}

/* ------------------------------------------------------------------ */
/* Linux — secret-tool(1) via libsecret                                */
/* ------------------------------------------------------------------ */

function linuxSave(token) {
  // secret-tool reads the secret from stdin
  execFileSync('secret-tool', [
    'store',
    '--label', `${SERVICE} refresh token`,
    'service', SERVICE,
    'account', ACCOUNT,
  ], { input: token, stdio: ['pipe', 'pipe', 'pipe'] });
}

function linuxLoad() {
  try {
    const out = execFileSync('secret-tool', [
      'lookup',
      'service', SERVICE,
      'account', ACCOUNT,
    ], { stdio: 'pipe' });
    return out.toString('utf8').trim() || null;
  } catch {
    return null;
  }
}

function linuxClear() {
  try {
    execFileSync('secret-tool', [
      'clear',
      'service', SERVICE,
      'account', ACCOUNT,
    ], { stdio: 'pipe' });
  } catch { /* ok if not found */ }
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Persist the OAuth refresh token into the OS credential vault.
 * No-op with a stderr warning if no vault is available.
 * @param {string} token
 */
export function saveRefreshToken(token) {
  const p = platform();
  try {
    if (p === 'darwin' && commandExists('security')) {
      macSave(token);
    } else if (p === 'win32' && commandExists('powershell')) {
      winSave(token);
    } else if (p === 'linux' && commandExists('secret-tool')) {
      linuxSave(token);
    } else {
      process.stderr.write(
        '[tora-deployer] warning: no credential vault found — refresh token not persisted; you will be prompted to log in next time.\n',
      );
    }
  } catch (err) {
    process.stderr.write(
      `[tora-deployer] warning: failed to save token to vault: ${err.message}\n`,
    );
  }
}

/**
 * Load the OAuth refresh token from the OS credential vault.
 * Returns null if not found or no vault is available (triggers login flow).
 * @returns {string|null}
 */
export function loadRefreshToken() {
  const p = platform();
  try {
    if (p === 'darwin' && commandExists('security')) {
      return macLoad();
    } else if (p === 'win32' && commandExists('powershell')) {
      return winLoad();
    } else if (p === 'linux' && commandExists('secret-tool')) {
      return linuxLoad();
    }
  } catch {
    // Fall through — vault unavailable
  }
  return null;
}

/**
 * Remove the stored refresh token from the OS credential vault.
 * Used on explicit logout.
 */
export function clear() {
  const p = platform();
  try {
    if (p === 'darwin' && commandExists('security')) {
      macClear();
    } else if (p === 'win32' && commandExists('powershell')) {
      winClear();
    } else if (p === 'linux' && commandExists('secret-tool')) {
      linuxClear();
    }
  } catch { /* best-effort */ }
}

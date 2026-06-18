type GlobalWithDev = typeof globalThis & { __DEV__?: boolean };

export function isDevMode(): boolean {
  return (globalThis as GlobalWithDev).__DEV__ === true;
}

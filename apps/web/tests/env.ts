/** Bun 1.4+ stores `process.env.X = undefined` as the string `"undefined"`. */
export function unsetEnv(name: string) {
  Reflect.deleteProperty(process.env, name);
}

export function restoreEnv(name: string, original: string | undefined) {
  if (original === undefined) {
    unsetEnv(name);
    return;
  }

  process.env[name] = original;
}

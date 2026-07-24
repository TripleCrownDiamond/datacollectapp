// Safe console wrapper that works without @types/node or DOM lib
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare var console: { warn: (...args: any[]) => void; log: (...args: any[]) => void } | undefined;

const noop = (..._args: unknown[]) => {};

export const warn: (...args: unknown[]) => void =
  typeof console !== 'undefined' && typeof console.warn !== 'undefined'
    ? console.warn.bind(console)
    : noop;

export const log: (...args: unknown[]) => void =
  typeof console !== 'undefined' && typeof console.log !== 'undefined'
    ? console.log.bind(console)
    : noop;

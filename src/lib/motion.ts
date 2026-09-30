/**
 * Motion vocabulary (Apple-style springs: critically damped by default, bounce only
 * for moments of success). Durations are spring "response", not fixed timings.
 */
export const spring = { type: "spring", bounce: 0, duration: 0.4 } as const;
export const snappy = { type: "spring", bounce: 0, duration: 0.28 } as const;
export const lively = { type: "spring", bounce: 0.3, duration: 0.5 } as const;

export const Constants = {
  MAX_AGE: 30 * 24 * 60 * 60,
  AVATAR_MAX_SIZE: 3 * 1024 * 1024,
  REGEX_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/,
} as const;

export type ConstantsType = typeof Constants;

// 认证相关常量
export const AUTH = {
  JWT_EXPIRY: '7d',
  BCRYPT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 6,
} as const

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// 错误消息常量
export const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing required fields',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  TOKEN_REQUIRED: 'No token provided',
  INVALID_TOKEN: 'Invalid token',
  SERVER_CONFIG_ERROR: 'Server configuration error',
} as const

// 数据库相关常量
export const DATABASE = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const
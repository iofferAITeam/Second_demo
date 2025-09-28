import winston from 'winston'
import path from 'path'

const logLevel = process.env.LOG_LEVEL || 'info'
const logFile = process.env.LOG_FILE || './logs/app.log'

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 安全的JSON.stringify函数，处理循环引用
function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, (key, value) => {
      // 跳过可能引起循环引用的属性
      if (key === 'config' || key === 'request' || key === 'response' || key === 'agent' || key === 'sockets') {
        return '[Circular]'
      }
      // 对于错误对象，只保留有用的信息
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }
      return value
    })
  } catch (error) {
    return '[Unable to stringify object]'
  }
}

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${safeStringify(meta)}`
    }
    return msg
  })
)

// 创建logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat
    }),

    // 文件输出
    new winston.transports.File({
      filename: path.resolve(logFile),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 错误日志单独文件
    new winston.transports.File({
      filename: path.resolve('./logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
})

// 开发环境下增加详细日志
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}
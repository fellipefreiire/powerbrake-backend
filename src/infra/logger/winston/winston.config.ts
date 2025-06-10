import { createLogger, format, transports } from 'winston'
import kleur from 'kleur'

const isDev = process.env.NODE_ENV === 'production'

function colorTime(time: number) {
  if (typeof time !== 'number' || isNaN(time)) return kleur.yellow(`${time}ms`)
  if (time < 300) return kleur.yellow(`${time}ms`)
  if (time < 1000) return kleur.yellow().bold(`${time}ms`)
  return kleur.red().bold(`${time}ms`)
}

function colorLevel(level: string) {
  switch (level.toLowerCase()) {
    case 'info':
      return kleur.blue(level.toUpperCase())
    case 'warn':
      return kleur.yellow(level.toUpperCase())
    case 'error':
      return kleur.red(level.toUpperCase())
    case 'debug':
      return kleur.magenta(level.toUpperCase())
    default:
      return level.toUpperCase()
  }
}

function formatDate(dateISO: string): string {
  if (!dateISO) return ''
  const date = new Date(dateISO)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('pt-BR', {
    timeZone: 'UTC',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const coloredProdFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    try {
      const timestamp = typeof info.timestamp === 'string' ? info.timestamp : ''
      const dateTime = formatDate(timestamp)
      const service = kleur.yellow(String(info.service ?? ''))
      const level = colorLevel(String(info.level ?? 'info'))
      const route = kleur.green(
        `{${String(info.route ?? '')}, ${String(info.httpMethod ?? '')}} route`,
      )
      const message = kleur.yellow(String(info.message ?? ''))
      const time =
        typeof info.timeToComplete === 'number'
          ? colorTime(info.timeToComplete)
          : kleur.yellow(String(info.timeToComplete ?? '') + 'ms')
      return `${dateTime} - service: ${service} - [${level}] - ${route} - ${message}: ${time}`
    } catch (err) {
      return `[LOGGER ERROR] ${err}\nRAW: ${JSON.stringify(info)}`
    }
  }),
)

const devFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf(({ timestamp, level, message, ...meta }) =>
    [
      `[${timestamp}]`,
      level,
      message,
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '',
    ]
      .filter(Boolean)
      .join(' '),
  ),
)

export function createDomainLogger(service: string) {
  return createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: isDev ? devFormat : coloredProdFormat,
    defaultMeta: { service },
    transports: [new transports.Console()],
  })
}

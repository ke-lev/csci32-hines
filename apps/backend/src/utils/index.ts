export function getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  switch (value) {
    case 'true':
      return true
    case 'false':
      return false
    case undefined:
      return defaultValue
    default:
      throw new Error(`Invalid boolean environment variable: ${name}=${value}`)
  }
}

export function getRequiredStringEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

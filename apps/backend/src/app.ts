import 'reflect-metadata'
import dotenv from 'dotenv'

dotenv.config()

// Load decorated modules only after the Reflect polyfill has executed. Bundlers
// can reorder static imports, so keeping this boundary avoids startup failures.
await import('./server')

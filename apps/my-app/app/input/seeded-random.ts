function xmur3(value: string) {
  let hash = 1779033703 ^ value.length

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return (hash ^= hash >>> 16) >>> 0
  }
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(value: string) {
  return xmur3(value)()
}

export function randomFor(seed: string, property: string) {
  return mulberry32(hashSeed(`${seed}:${property}`))()
}

export function numberFor(seed: string, property: string, minimum: number, maximum: number) {
  return Math.round(minimum + randomFor(seed, property) * (maximum - minimum))
}

export function pickFor<T>(seed: string, property: string, values: readonly T[]) {
  if (values.length === 0) {
    throw new Error(`cannot choose ${property} from an empty list`)
  }

  return values[Math.floor(randomFor(seed, property) * values.length)] as T
}

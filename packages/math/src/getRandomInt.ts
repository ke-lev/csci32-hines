/**
 * Returns a random integer inside the inclusive range from min to max.
 */
export function getRandomInt(min: number, max: number) {
  const lowerBound = Math.ceil(min)
  const upperBound = Math.floor(max)

  if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
    throw new RangeError('getRandomInt requires finite bounds')
  }

  if (lowerBound > upperBound) {
    throw new RangeError('getRandomInt requires min to be less than or equal to max')
  }

  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound
}

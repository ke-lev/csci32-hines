/**
 * Picks the latest post on or before the access date. If the access date is before
 * the first post, falls back to that first post. Kept free of `server-only` imports
 * so the timeline client can rerun the same rule after browser history changes.
 */
export function getClosestTimelinePost<Post extends { date: string }>(posts: Post[], accessDate: Date) {
  const accessDay = Date.UTC(accessDate.getUTCFullYear(), accessDate.getUTCMonth(), accessDate.getUTCDate())

  const latestAvailable = posts.reduce<Post | undefined>((closest, post) => {
    const postDate = Date.parse(post.date)

    if (postDate > accessDay || (closest && postDate <= Date.parse(closest.date))) {
      return closest
    }

    return post
  }, undefined)

  if (latestAvailable) {
    return latestAvailable
  }

  return posts.reduce<Post | undefined>((earliest, post) => {
    if (!earliest || Date.parse(post.date) < Date.parse(earliest.date)) {
      return post
    }

    return earliest
  }, undefined)
}

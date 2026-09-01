/**
 * Picks the post whose date sits closest to the access date. Kept free of `server-only`
 * imports so the timeline client can rerun the same rule after browser history changes.
 */
export function getClosestTimelinePost<Post extends { date: string }>(posts: Post[], accessDate: Date) {
  const accessDay = Date.UTC(accessDate.getUTCFullYear(), accessDate.getUTCMonth(), accessDate.getUTCDate())

  return posts.reduce<Post | undefined>((closest, post) => {
    if (!closest) {
      return post
    }

    const postDistance = Math.abs(Date.parse(post.date) - accessDay)
    const closestDistance = Math.abs(Date.parse(closest.date) - accessDay)

    return postDistance < closestDistance ? post : closest
  }, undefined)
}

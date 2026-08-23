export default function TimelineLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6" aria-label="Loading timeline post">
      <div className="h-[min(650px,72svh)] w-full max-w-[620px] animate-pulse rounded-[2rem] border border-line bg-row-hover motion-reduce:animate-none" />
    </main>
  )
}

export default function Loading() {
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <div className="flex flex-col gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-64 max-w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <section className="total-balance">
            <div className="size-[100px] shrink-0 animate-pulse rounded-full bg-gray-200 sm:size-[120px]" />
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="h-5 w-40 max-w-full animate-pulse rounded bg-gray-200" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-48 max-w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </section>
        </header>

        <section className="recent-transactions min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 w-32 shrink-0 animate-pulse rounded bg-gray-200" />
            ))}
          </div>

          <div className="h-20 animate-pulse rounded-xl bg-blue-50" />

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="mb-4 flex justify-between">
              <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="min-w-0 overflow-hidden">
              <div className="flex gap-6 border-b bg-gray-50 px-3 py-4">
                {[32, 20, 20, 24, 20, 24].map((width, index) => (
                  <div key={index} className="h-3 shrink-0 animate-pulse rounded bg-gray-200" style={{ width: `${width * 4}px` }} />
                ))}
              </div>
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <div key={row} className="flex items-center gap-6 border-b px-3 py-5">
                  {[36, 20, 24, 28, 20, 24].map((width, index) => (
                    <div key={index} className="h-4 shrink-0 animate-pulse rounded bg-gray-100" style={{ width: `${width * 4}px` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <aside className="right-sidebar">
        <section className="flex flex-col pb-8">
          <div className="h-[120px] animate-pulse bg-gray-200" />
          <div className="px-6">
            <div className="-mt-8 size-24 rounded-full border-8 border-white bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-52 max-w-full animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-8 px-6 py-8">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-[190px] w-full max-w-[320px] animate-pulse rounded-[20px] bg-gray-200" />
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </section>
      </aside>
    </section>
  );
}

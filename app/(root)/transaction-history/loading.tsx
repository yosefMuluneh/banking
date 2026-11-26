export default function Loading() {
  return (
    <div className="transactions">
      <div className="transactions-header">
        <div className="flex flex-col gap-2">
          <div className="h-9 w-64 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-52 max-w-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-3">
            <div className="h-5 w-48 animate-pulse rounded bg-blue-400/60" />
            <div className="h-4 w-60 max-w-full animate-pulse rounded bg-blue-400/60" />
            <div className="h-4 w-40 animate-pulse rounded bg-blue-400/60" />
          </div>
          <div className="transactions-account-balance">
            <div className="h-4 w-28 animate-pulse rounded bg-blue-400/60" />
            <div className="h-7 w-36 animate-pulse rounded bg-blue-400/60" />
          </div>
        </div>

        <section className="flex w-full min-w-0 flex-col gap-6">
          <div className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="flex gap-6 border-b bg-gray-50 px-3 py-4">
              {[32, 20, 20, 24, 20, 24].map((width, index) => (
                <div key={index} className="h-3 shrink-0 animate-pulse rounded bg-gray-200" style={{ width: `${width * 4}px` }} />
              ))}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
              <div key={row} className="flex items-center gap-6 border-b px-3 py-5">
                {[36, 20, 24, 28, 20, 24].map((width, index) => (
                  <div key={index} className="h-4 shrink-0 animate-pulse rounded bg-gray-100" style={{ width: `${width * 4}px` }} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </section>
      </div>
    </div>
  );
}

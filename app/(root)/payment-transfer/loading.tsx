export default function Loading() {
  return (
    <section className="payment-transfer">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 max-w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
      </div>

      <section className="size-full pt-5">
        <div className="flex w-full max-w-[850px] flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-12 flex-1 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-5">
            <div className="mb-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-full max-w-[280px] animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="h-11 w-full max-w-[220px] animate-pulse rounded-lg bg-gray-200" />
        </div>
      </section>
    </section>
  );
}

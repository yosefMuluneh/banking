export default function Loading() {
  return (
    <section className="my-banks">
      <div className="w-full">
        <div className="flex flex-col gap-2">
          <div className="h-9 w-64 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="flex flex-wrap gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[190px] w-full max-w-[320px] animate-pulse rounded-[20px] bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

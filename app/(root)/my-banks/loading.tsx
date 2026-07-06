export default function Loading() {
  return (
    <section className="fle">
      <div className="my-banks">
        <div className="flex flex-col gap-4 mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[340px] h-[180px] bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
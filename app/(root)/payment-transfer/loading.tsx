export default function Loading() {
  return (
    <div className="payment-transfer">
      <div className="payment-transfer_header">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="payment-transfer_container">
        <div className="payment-transfer_form-box">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="pt-4">
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
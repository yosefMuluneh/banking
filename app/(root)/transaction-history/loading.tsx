export default function Loading() {
  return (
    <div className='transactions'>
      <div className='transactions-header'>
        {/* Header skeleton */}
        <div className='flex flex-col gap-4'>
          <div className='h-10 w-64 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-48 bg-gray-200 rounded animate-pulse' />
        </div>
      </div>
      
      <div className='space-y-6'>
        {/* Account card skeleton */}
        <div className='transactions-account p-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl'>
          <div className='flex justify-between items-start'>
            <div className='flex flex-col gap-2'>
              <div className='h-6 w-48 bg-blue-400 rounded animate-pulse' />
              <div className='h-4 w-64 bg-blue-400 rounded animate-pulse' />
              <div className='h-4 w-40 bg-blue-400 rounded animate-pulse' />
            </div>
            <div className='flex flex-col items-end gap-1'>
              <div className='h-4 w-28 bg-blue-400 rounded animate-pulse' />
              <div className='h-8 w-36 bg-blue-400 rounded animate-pulse' />
            </div>
          </div>
        </div>

        {/* Transactions table skeleton */}
        <section className='flex w-full flex-col gap-6'>
          <div className='bg-white rounded-xl shadow p-6'>
            <div className='space-y-4'>
              {/* Table header */}
              <div className='flex gap-4 pb-4 border-b'>
                <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-48 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto' />
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className='flex items-center gap-4 py-3 border-b last:border-0'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
                  <div className='flex-1'>
                    <div className='h-4 w-40 bg-gray-200 rounded animate-pulse mb-2' />
                    <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='h-4 w-6 bg-gray-200 rounded animate-pulse' />
                  <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                  <div className='h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto' />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
export default function Loading() {
  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          {/* Header skeleton */}
          <div className='flex flex-col gap-4'>
            <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-64 bg-gray-200 rounded animate-pulse' />
            <div className='h-4 w-96 bg-gray-200 rounded animate-pulse' />
          </div>
          
          {/* Balance box skeleton */}
          <div className='mt-6 p-6 bg-white rounded-xl shadow-lg'>
            <div className='h-4 w-40 bg-gray-200 rounded animate-pulse mb-4' />
            <div className='h-12 w-56 bg-gray-200 rounded animate-pulse' />
            <div className='flex gap-8 mt-4'>
              <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
              <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
            </div>
          </div>
        </header>

        {/* Recent transactions skeleton */}
        <div className='mt-8'>
          <div className='h-6 w-48 bg-gray-200 rounded animate-pulse mb-4' />
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex items-center gap-4 p-4 bg-white rounded-lg shadow'>
                <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse' />
                <div className='flex-1'>
                  <div className='h-4 w-40 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right sidebar skeleton */}
      <div className='hidden lg:block w-80'>
        <div className='p-6 bg-white rounded-xl shadow-lg'>
          <div className='h-6 w-32 bg-gray-200 rounded animate-pulse mb-4' />
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded animate-pulse' />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
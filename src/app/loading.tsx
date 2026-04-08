import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-[#86909C]">加载中...</p>
        </div>
      </div>
    </div>
  )
}
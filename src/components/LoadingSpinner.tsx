export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[#E8E8E8] rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#00B578] rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}

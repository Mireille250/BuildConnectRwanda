export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-28 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-3 bg-gray-100 rounded-full w-16" />
        <div className="h-3 bg-gray-100 rounded-full w-20" />
        <div className="h-3 bg-gray-100 rounded-full w-14" />
      </div>
    </div>
  );
}

export function SkeletonJobCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <div className="h-5 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-40 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 rounded-full w-20" />
            <div className="h-6 bg-gray-100 rounded-full w-24" />
            <div className="h-6 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-40" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-14" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        <div className="h-9 bg-gray-100 rounded-xl flex-1" />
      </div>
    </div>
  );
}

export function SkeletonSupplierCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-28 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-36 mb-4" />
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-100 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonConversation() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-40" />
      </div>
    </div>
  );
}

export function SkeletonMessage({ isMe = false }: { isMe?: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className={`h-10 bg-gray-200 rounded-2xl ${isMe ? 'w-48' : 'w-40'}`} />
    </div>
  );
}

export function SkeletonDashboardStat() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-28" />
    </div>
  );
}

export function SkeletonText({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <div className={`${height} ${width} bg-gray-200 rounded animate-pulse`} />;
}

export function SkeletonAvatar({ size = 'w-12 h-12' }: { size?: string }) {
  return <div className={`${size} rounded-full bg-gray-200 animate-pulse shrink-0`} />;
}

export function SkeletonButton({ width = 'w-24' }: { width?: string }) {
  return <div className={`h-9 ${width} bg-gray-200 rounded-xl animate-pulse`} />;
}

export function SkeletonPublicProfile() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Cover */}
      <div className="h-64 bg-gray-200" />
      <div className="max-w-5xl mx-auto px-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 -mt-20 relative z-10 p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 -mt-12 shrink-0" />
            <div className="flex-1 pt-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-36 mb-3" />
              <div className="flex gap-4">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-gray-100 rounded-xl" />
              <div className="h-10 w-24 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-4 bg-gray-200 rounded w-16 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="h-7 bg-gray-100 rounded-full w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
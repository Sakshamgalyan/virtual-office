export const SidebarSkeleton = () => (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col border-r border-[#163832] bg-[#0b2b26]">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-[#163832]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#163832] animate-pulse" />
                    <div className="h-4 w-24 bg-[#163832] rounded animate-pulse" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 py-4 px-2 space-y-6">
                {[1, 2, 3].map((section) => (
                    <div key={section} className="space-y-2">
                        <div className="h-3 w-20 bg-[#163832] rounded animate-pulse ml-3 mb-3" />
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-3 px-3 py-2">
                                <div className="w-5 h-5 rounded bg-[#163832] animate-pulse shrink-0" />
                                <div className="h-3 w-32 bg-[#163832] rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Footer Skeleton */}
            <div className="p-2 border-t border-[#163832] space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-5 h-5 rounded bg-[#163832] animate-pulse" />
                    <div className="h-3 w-24 bg-[#163832] rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-5 h-5 rounded bg-[#163832] animate-pulse" />
                    <div className="h-3 w-24 bg-[#163832] rounded animate-pulse" />
                </div>
            </div>
        </aside>
    );
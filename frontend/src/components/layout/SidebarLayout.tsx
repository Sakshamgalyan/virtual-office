'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarCollapsed } = useSelector((state: RootState) => state.ui);

    return (
        <div className="min-h-screen bg-[#051f20]">
            <Sidebar />
            <main
                className={cn(
                    "transition-all duration-300 ease-in-out min-h-screen",
                    isSidebarCollapsed ? "ml-16" : "ml-64"
                )}
            >
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

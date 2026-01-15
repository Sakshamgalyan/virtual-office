'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    HelpCircle,
    Plus,
    ChevronLeft,
    ChevronRight,
    Box,
    Layers,
    LogOut
} from 'lucide-react';

import { RootState } from '@/store';
import { toggleSidebar, addFloor } from '@/store/slices/uiSlice';
import { clearUser } from '@/store/slices/authSlice'; // Assuming clearUser exists for logout
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SidebarSkeleton } from './SidebarSkeleton';
import api from '@/lib/apiClient';

interface SidebarItem {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
    visible?: string[]; // Roles allowed to see this item
}

interface SidebarSection {
    title?: string;
    items: SidebarItem[];
    bottomSpacer?: boolean;
}

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isSidebarCollapsed, floors } = useSelector((state: RootState) => state.ui);
    const { user, isLoading } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const userRole = user?.role?.toLowerCase() || 'admin'; // Default to guest if no user

    const handleToggle = () => {
        dispatch(toggleSidebar());
    };

    const handleAddFloor = () => {
        const newFloor = `Floor ${floors.length + 1}`;
        dispatch(addFloor(newFloor));
    };

    const handleLogout = async () => {
        const { data } = await api.post("/users/logout");
        if(data === "success"){
            router.push('/');
        }
    };

    // --- Configuration ---
    const sidebarSections: SidebarSection[] = useMemo(() => [
        {
            title: "Book Room",
            items: [
                {
                    icon: LayoutDashboard,
                    label: "Meeting Rooms",
                    href: "/home/meeting-rooms",
                    visible: ["admin", "manager", "employee", "guest"]
                },
                {
                    icon: Users,
                    label: "Conference Rooms",
                    href: "/home/conference-rooms",
                    visible: ["admin", "manager", "employee"]
                },
                {
                    icon: Users,
                    label: "Brainstorm Rooms",
                    href: "/home/brainstorm-rooms",
                    visible: ["admin", "manager"]
                },
                {
                    icon: Plus,
                    label: "Add Room",
                    onClick: () => { },
                    visible: ["admin"]
                },
            ]
        },
        {
            title: "Floors & Teams",
            items: floors.map(floor => ({
                icon: Layers,
                label: floor,
                href: `/home/floor/${floor.toLowerCase()}`,
                visible: ["admin", "manager", "employee", "guest"]
            }))
        },
        {
            title: "General",
            items: [
                {
                    icon: Calendar,
                    label: "Schedule",
                    href: "/home/schedule",
                    visible: ["admin", "manager", "employee"]
                }
            ],
            bottomSpacer: true
        }
    ], [floors]);

    const bottomItems: SidebarItem[] = [
        {
            icon: Settings,
            label: "Settings",
            href: "/home/settings",
            visible: ["admin", "manager", "employee", "guest"]
        },
        {
            icon: HelpCircle,
            label: "Help & Guides",
            href: "/home/help",
            visible: ["admin", "manager", "employee", "guest"]
        },
        {
            icon: LogOut,
            label: "Logout",
            onClick: handleLogout,
            visible: ["admin", "manager", "employee", "guest"]
        }
    ];

    // --- Helper Components ---
    const NavItem = ({ item }: { item: SidebarItem }) => {
        if (item.visible && !item.visible.includes(userRole)) {
            return null;
        }

        const isActive = item.href ? pathname === item.href : false;

        const content = (
            <div
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group",
                    isActive
                        ? "bg-[#235347] text-[#daf1de]"
                        : "text-[#8eb69b] hover:bg-[#163832] hover:text-[#daf1de]"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
            >
                <item.icon size={20} className="shrink-0" />
                {!isSidebarCollapsed && (
                    <span className="font-medium whitespace-nowrap overflow-hidden text-sm">
                        {item.label}
                    </span>
                )}
            </div>
        );

        if (item.onClick) {
            return <div onClick={item.onClick}>{content}</div>;
        }

        return <Link href={item.href || '#'}>{content}</Link>;
    };

    if (isLoading) {
        return <SidebarSkeleton />;
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-[#163832] bg-[#0b2b26] overflow-y-auto",
                isSidebarCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-[#163832]">
                {!isSidebarCollapsed && (
                    <Link href="/home" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#235347] to-[#163832] flex items-center justify-center text-[#daf1de]">
                            <Box size={20} />
                        </div>
                        <span className="font-bold text-lg text-[#daf1de]">Virtual Office</span>
                    </Link>
                )}
                <button
                    onClick={handleToggle}
                    className={cn(
                        "p-1.5 rounded-md hover:bg-[#163832] text-[#8eb69b] transition-colors",
                        isSidebarCollapsed ? "mx-auto" : ""
                    )}
                >
                    {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar flex flex-col gap-6">
                {sidebarSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        {!isSidebarCollapsed && section.title && (
                            // Only show title if at least one item is visible
                            section.items.some(i => !i.visible || i.visible.includes(userRole)) && (
                                <div className="px-3 text-xs font-semibold text-[#8eb69b]/60 uppercase tracking-wider mb-2">
                                    {section.title}
                                </div>
                            )
                        )}
                        {section.items.map((item, itemIdx) => (
                            <NavItem key={itemIdx} item={item} />
                        ))}
                        {section.bottomSpacer && <div className="mt-auto"></div>}
                    </div>
                ))}

                {/* Admin Add Section Button - Only for admin */}
                {userRole === 'admin' && (
                    <button
                        onClick={handleAddFloor}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group w-full text-left",
                            "text-[#8eb69b] hover:bg-[#163832] hover:text-[#daf1de]"
                        )}
                        title={isSidebarCollapsed ? "Add New Floor" : undefined}
                    >
                        <Plus size={20} className="shrink-0" />
                        {!isSidebarCollapsed && (
                            <span className="font-medium text-sm">Add New Floor</span>
                        )}
                    </button>
                )}
            </div>

            {/* Bottom Footer */}
            <div className="p-2 border-t border-[#163832] space-y-1">
                {bottomItems.map((item, idx) => (
                    <NavItem key={idx} item={item} />
                ))}
            </div>
        </aside>
    );
}

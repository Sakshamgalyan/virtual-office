import SidebarLayout from "@/components/layout/SidebarLayout";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarLayout>
            {children}
        </SidebarLayout>
    );
}

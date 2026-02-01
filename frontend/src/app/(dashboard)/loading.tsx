import Loading from "@/components/layout/Loading";

export default function DashboardLoading() {
    return (
        <div className="w-full h-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Loading fullScreen={false} />
        </div>
    );
}

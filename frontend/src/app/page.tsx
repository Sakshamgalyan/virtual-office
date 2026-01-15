"use client";

import AuthComponent from "@/components/Auth/AuthComponent";
import WorkSpace from "@/components/Home/WorkSpace";
import Loading from "@/components/layout/Loading";
import { useAuth } from "@/context/auth";

export default function WorkspacePage() {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen={true} />;
  if (!user) return <AuthComponent />;

  return <WorkSpace />;
}

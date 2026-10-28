import type { ReactNode } from "react";
import AdminGuard from "@/admin/AdminGuard";
import AdminLayout from "@/admin/AdminLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

import type { ReactNode } from "react";
import CaslGuard from "@/admin/CaslGuard";
import AdminLayout from "@/admin/AdminLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CaslGuard>
      <AdminLayout>{children}</AdminLayout>
    </CaslGuard>
  );
}

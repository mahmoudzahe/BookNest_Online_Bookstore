import ChangePassword from "@/views/ChangePassword";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><ChangePassword /></ProtectedRoute>
  );
}

import ProtectedRoute from "@/components/ProtectedRoute";
import UserDashboard from "@/views/UserDashboard";

export default function Page() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}

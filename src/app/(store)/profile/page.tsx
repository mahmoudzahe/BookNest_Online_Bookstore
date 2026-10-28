import Profile from "@/views/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><Profile /></ProtectedRoute>
  );
}

import OrderSuccess from "@/views/OrderSuccess";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><OrderSuccess /></ProtectedRoute>
  );
}

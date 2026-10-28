import OrderDetails from "@/views/OrderDetails";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><OrderDetails /></ProtectedRoute>
  );
}

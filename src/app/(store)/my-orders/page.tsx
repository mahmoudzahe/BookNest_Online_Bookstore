import MyOrders from "@/views/MyOrders";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><MyOrders /></ProtectedRoute>
  );
}

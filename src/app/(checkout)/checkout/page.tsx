import Checkout from "@/views/Checkout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><Checkout /></ProtectedRoute>
  );
}

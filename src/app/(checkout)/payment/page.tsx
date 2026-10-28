import Payment from "@/views/Payment";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute><Payment /></ProtectedRoute>
  );
}

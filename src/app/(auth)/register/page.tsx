import Register from "@/views/Register";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>} ><Register /></Suspense>
  );
}

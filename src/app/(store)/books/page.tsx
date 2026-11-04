import Books from "@/views/Books";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>} ><Books /></Suspense>
  );
}

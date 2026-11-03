import Books from "@/views/Books";
import { Suspense } from "react";
import { T } from "@/i18n/LocaleContext";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p>
          <T text="Loading..." />
        </p>
      }
    >
      <Books />
    </Suspense>
  );
}

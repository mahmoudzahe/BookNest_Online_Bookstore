import Register from "@/views/Register";
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
      <Register />
    </Suspense>
  );
}

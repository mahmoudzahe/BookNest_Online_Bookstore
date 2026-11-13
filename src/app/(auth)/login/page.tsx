import Login from "@/views/Login";
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
      <Login />
    </Suspense>
  );
}

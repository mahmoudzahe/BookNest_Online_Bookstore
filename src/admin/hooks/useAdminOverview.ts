import { useEffect, useState } from "react";
import { getAdminOverview } from "@/services/adminApi";
import type { Translator } from "@/i18n/translation";

export function useAdminOverview(t: Translator) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getAdminOverview>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active)
          setError(t("Could not load store statistics. Check JSON Server."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}

import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AuthUser } from "@/types/user";

export function defineAbilityFor(user: AuthUser | null) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (user?.role === "admin") {
    can("access", "AdminPanel");
  }

  return build();
}

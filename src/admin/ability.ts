import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { MongoAbility } from "@casl/ability";
import type { AuthUser } from "@/types/user";

type Actions = "access" | "read" | "addToCart" | "update" | "delete";
type Subjects = "AdminPanel" | "Book";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: AuthUser | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  can("read", "Book");
  can("addToCart", "Book");

  if (user?.role === "admin") {
    can("access", "AdminPanel");
    can("update", "Book");
    can("delete", "Book");
  }

  return build();
}

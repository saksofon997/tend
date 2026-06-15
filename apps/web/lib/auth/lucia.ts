import { getDb } from "@/lib/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "@tend/db";
import { Lucia } from "lucia";

const adapter = new DrizzlePostgreSQLAdapter(getDb() as never, sessions as never, users as never);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  getUserAttributes: (attributes: { displayName: string; email: string }) => ({
    displayName: attributes.displayName,
    email: attributes.email,
  }),
});

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
};

export type LuciaAuthUser = AuthUser;

export function toAuthUser(user: LuciaAuthUser): AuthUser {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
  };
}

declare module "lucia" {
  interface Register {
    LuciaId: "TendAuth";
    DatabaseUserAttributes: {
      displayName: string;
      email: string;
    };
    DatabaseSessionAttributes: Record<string, never>;
  }
}

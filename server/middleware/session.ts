import { db } from "@/database";
import { sessionTable } from "@/database/schemas";
import type { ENV } from "@/lib/env";
import { env } from "@/shared/env";
import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const SessionMiddleware = createMiddleware<ENV>(
  async (c: Context, next: Next) => {
    const token = getCookie(c, env.SESSION_COOKIE);
    if (!token) {
      c.set("user", null);
      c.set("session", null);
      throw new HTTPException(401, {
        message: "No session has set",
      });
    }

    const session = await db.query.sessionTable.findFirst({
      where: (session, { eq }) => eq(session.token, token),
    });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      deleteCookie(c, env.SESSION_COOKIE);
      throw new HTTPException(401, {
        message: "No session has found!",
      });
    }

    const user = await db.query.branchTable.findFirst({
      where: (user, { eq }) => eq(user.id, session.branchId),
    });
    if (!user) {
      await db
        .delete(sessionTable)
        .where(eq(sessionTable.branchId, session.branchId));
      c.set("user", null);
      c.set("session", null);
      deleteCookie(c, env.SESSION_COOKIE);
      throw new HTTPException(401, {
        message: "No account found!",
      });
    }

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      await db.delete(sessionTable).where(eq(sessionTable.branchId, user.id));
      c.set("user", null);
      c.set("session", null);
      deleteCookie(c, env.SESSION_COOKIE);
      throw new HTTPException(401, {
        message: "Session expired!",
      });
    }

    const updated = await db
      .update(sessionTable)
      .set({
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 24),
      })
      .where(eq(sessionTable.id, session.id))
      .returning();

    setCookie(
      c,
      env.SESSION_COOKIE,
      updated[0].token
      //   , {
      //   path: "/",
      //   sameSite: "Lax",
      //   httpOnly: true,
      //   secure: true,
      //   expires: new Date(Date.now() + 1000 * 60),
      // }
    );

    c.set("user", user);
    c.set("session", session);

    await next();
  }
);

import { db } from "@/database";
import * as schema from "@/database/schemas";
import type { ENV } from "@/lib/env";
import { SessionMiddleware } from "@/middleware/session";
import { env } from "@/shared/env";
import type { SuccessResponse } from "@/shared/response";
import type { Branch } from "@/shared/types/schema";
import { Login, Register } from "@/shared/validation/authentication";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

const route = new Hono<ENV>()

  // Basepath
  .basePath("/auth")

  // Register route
  .post("/register", zValidator("form", Register), async (c) => {
    const { name, businessName, email, username, password } =
      c.req.valid("form");
    const hash = await Bun.password.hash(password);

    try {
      const [company] = await db
        .insert(schema.companyTable)
        .values({
          email,
          businessName,
        })
        .returning({ id: schema.companyTable.id });

      const [account] = await db
        .insert(schema.accountTable)
        .values({
          password: hash,
          companyId: company.id,
        })
        .returning({ id: schema.accountTable.id });

      const [branch] = await db
        .insert(schema.branchTable)
        .values({
          username,
          name,
          type: "main",
          accountId: account.id,
          companyId: company.id,
        })
        .returning();

      return c.json<SuccessResponse<Branch>>(
        {
          success: true,
          message: "Successfully created account!",
          data: { ...branch },
        },
        201
      );
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: "Username already used",
          cause: { form: true },
        });
      }
      throw new HTTPException(500, { message: "Failed to create user" });
    }
  })

  // Login route
  .post("/login", zValidator("form", Login), async (c) => {
    const { username, password } = c.req.valid("form");

    const existing = await db.query.branchTable.findFirst({
      where: (exist, { eq }) => eq(exist.username, username),
    });
    if (!existing || existing.status === false) {
      throw new HTTPException(401, {
        message: "Incorrect credentials!",
        cause: { form: true },
      });
    }

    const company = await db.query.companyTable.findFirst({
      where: (company, { eq }) => eq(company.id, existing.companyId),
    });
    if (company && company.status === false) {
      throw new HTTPException(401, {
        message: "Incorrect credentials!",
        cause: { form: true },
      });
    }

    const account = await db.query.accountTable.findFirst({
      where: (account, { eq }) => eq(account.id, existing.accountId),
    });
    if (!account) {
      throw new HTTPException(401, {
        message: "Incorrect credentials!",
        cause: { form: true },
      });
    }

    const valid = await Bun.password.verify(password, account.password);
    if (!valid) {
      throw new HTTPException(401, {
        message: "Incorrect credentials!",
        cause: { form: true },
      });
    }

    const [session] = await db
      .insert(schema.sessionTable)
      .values({
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 24),
        branchId: existing.id,
      })
      .returning();

    setCookie(
      c,
      env.SESSION_COOKIE,
      session.token
      //   , {
      //   path: "/",
      //   sameSite: "Lax",
      //   httpOnly: true,
      //   secure: true,
      //   expires: new Date(Date.now() + 1000 * 60),
      // }
    );

    return c.json<SuccessResponse<Branch>>(
      {
        success: true,
        message: "Successfully login!",
        data: { ...existing },
      },
      200
    );
  })

  // Sign-out route
  .get("/sign-out", SessionMiddleware, async (c) => {
    const session = c.get("session")!;
    if (!session) {
      throw new HTTPException(401, {
        message: "No session found!",
      });
    }

    deleteCookie(c, env.SESSION_COOKIE);
    await db
      .delete(schema.sessionTable)
      .where(eq(schema.sessionTable.branchId, session.branchId));

    return c.json<SuccessResponse>(
      {
        success: true,
        message: "Successfully sign-out!",
      },
      200
    );
  })

  // Me route
  .get("/me", SessionMiddleware, async (c) => {
    const user = c.get("user")!;

    return c.json<SuccessResponse<Branch>>(
      {
        success: true,
        message: "Details!",
        data: { ...user },
      },
      200
    );
  });

export default route;

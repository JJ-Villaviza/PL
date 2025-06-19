import type { ENV } from "@/lib/env";
import type { Branch } from "@/shared/types/schema";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const AdministratorMiddleware = createMiddleware<ENV>(
  async (c: Context, next: Next) => {
    const user = c.get("user") as Branch;

    if (user.type !== "main") {
      throw new HTTPException(401, {
        message: "Unauthorized!",
      });
    }

    await next();
  }
);

import { db } from "@/database";
import * as schema from "@/database/schemas";
import type { ENV } from "@/lib/env";
import { AdministratorMiddleware } from "@/middleware/administrator";
import { SessionMiddleware } from "@/middleware/session";
import type { SuccessResponse } from "@/shared/response";
import type { Branch } from "@/shared/types/schema";
import {
  AddBranch,
  UpdatePassword,
  UpdatedBranch,
} from "@/shared/validation/branch";
import { Id } from "@/shared/validation/id";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

const route = new Hono<ENV>()

  // Basepath
  .basePath("/branch")

  // Create branch route
  .post(
    "/create-branch",
    zValidator("form", AddBranch),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { name, username, password } = c.req.valid("form");
      const hash = await Bun.password.hash(password);
      const user = c.get("user")!;

      try {
        const [account] = await db
          .insert(schema.accountTable)
          .values({
            password: hash,
            companyId: user.companyId,
          })
          .returning({ id: schema.accountTable.id });

        const [branch] = await db
          .insert(schema.branchTable)
          .values({
            username,
            name,
            type: "branch",
            accountId: account.id,
            companyId: user.companyId,
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
    }
  )

  // List branch for anonymous
  .get("/list", zValidator("query", Id), async (c) => {
    const { id } = c.req.valid("query");

    const branch = await db.query.branchTable.findMany({
      where: (branch, { eq }) => eq(branch.companyId, id),
    });
    if (branch.length === 0) {
      throw new HTTPException(404, { message: "No branches found!" });
    }

    return c.json<SuccessResponse<Branch[]>>(
      {
        success: true,
        message: "Branch list!",
        data: [...branch],
      },
      200
    );
  })

  // Branch details route
  .get("/", zValidator("query", Id), async (c) => {
    const { id } = c.req.valid("query");

    const branch = await db.query.branchTable.findFirst({
      where: (branch, { eq }) => eq(branch.id, id),
    });
    if (!branch) {
      throw new HTTPException(404, { message: "Not Found!" });
    }

    return c.json<SuccessResponse<Branch>>(
      {
        success: true,
        message: "Branch list!",
        data: { ...branch },
      },
      200
    );
  })

  // Update branch details
  .patch(
    "/update-branch",
    zValidator("form", UpdatedBranch),
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { name, username } = c.req.valid("form");
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      try {
        await db
          .update(schema.branchTable)
          .set({
            username,
            name,
          })
          .where(
            and(
              eq(schema.branchTable.id, id),
              eq(schema.branchTable.companyId, user.companyId)
            )
          );

        return c.json<SuccessResponse>(
          {
            success: true,
            message: "Successfully updated branch!",
          },
          200
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
    }
  )

  // Update branch password
  .patch(
    "/update-password",
    zValidator("form", UpdatePassword),
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { password } = c.req.valid("form");
      const { id } = c.req.valid("query");
      const user = c.get("user")!;
      const hash = await Bun.password.hash(password);

      const update = await db
        .update(schema.accountTable)
        .set({ password: hash })
        .where(
          and(
            eq(schema.accountTable.id, id),
            eq(schema.accountTable.companyId, user.companyId)
          )
        );
      if (!update) {
        throw new HTTPException(409, { message: "Can't update password" });
      }

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Successfully update password",
        },
        200
      );
    }
  )

  // Active branch status
  .patch(
    "/active",
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      await db
        .update(schema.branchTable)
        .set({ status: true })
        .where(
          and(
            eq(schema.branchTable.id, id),
            eq(schema.branchTable.companyId, user.companyId)
          )
        );

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Successfully activated a branch!",
        },
        200
      );
    }
  )

  // Deactive branch status
  .patch(
    "/deactive",
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      await db
        .update(schema.branchTable)
        .set({ status: false, deletedAt: new Date() })
        .where(
          and(
            eq(schema.branchTable.id, id),
            eq(schema.branchTable.companyId, user.companyId)
          )
        );

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Successfully deactivated a branch!",
        },
        200
      );
    }
  );

export default route;

import { db } from "@/database";
import * as schema from "@/database/schemas";
import type { ENV } from "@/lib/env";
import { AdministratorMiddleware } from "@/middleware/administrator";
import { SessionMiddleware } from "@/middleware/session";
import type { SuccessResponse } from "@/shared/response";
import type { Company } from "@/shared/types/schema";
import {
  AdditionalCompanyDetails,
  UpdateCompany,
} from "@/shared/validation/company";
import { Id } from "@/shared/validation/id";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const route = new Hono<ENV>()

  // Basepath
  .basePath("/company")

  // Additional details for company
  .patch(
    "/add-details",
    zValidator("form", AdditionalCompanyDetails),
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { description, mission, vision } = c.req.valid("form");
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      try {
        await db
          .update(schema.companyTable)
          .set({ description, mission, vision })
          .where(
            and(
              eq(schema.companyTable.id, user.companyId),
              eq(schema.companyTable.id, id)
            )
          );

        return c.json<SuccessResponse>(
          {
            success: true,
            message: "Successfully added details!",
          },
          201
        );
      } catch (error) {
        throw new HTTPException(409, {
          message: "Can't add details",
          cause: { form: true },
        });
      }
    }
  )

  // Update company
  .patch(
    "/update-company",
    zValidator("form", UpdateCompany),
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { email, businessName, description, mission, vision } =
        c.req.valid("form");
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      try {
        await db
          .update(schema.companyTable)
          .set({ email, businessName, description, mission, vision })
          .where(
            and(
              eq(schema.companyTable.id, user.companyId),
              eq(schema.companyTable.id, id)
            )
          );

        return c.json<SuccessResponse>(
          {
            success: true,
            message: "Successfully updated details",
          },
          200
        );
      } catch (error) {
        throw new HTTPException(409, {
          message: "Can't update details!",
          cause: { form: true },
        });
      }
    }
  )

  // Deactivate company
  .patch(
    "/deactive",
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      await db
        .update(schema.companyTable)
        .set({ status: false })
        .where(
          and(
            eq(schema.companyTable.id, user.companyId),
            eq(schema.companyTable.id, id)
          )
        );

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Successfully deactivate company!",
        },
        200
      );
    }
  )

  // Activate company
  .patch(
    "/active",
    zValidator("query", Id),
    SessionMiddleware,
    AdministratorMiddleware,
    async (c) => {
      const { id } = c.req.valid("query");
      const user = c.get("user")!;

      await db
        .update(schema.companyTable)
        .set({ status: true })
        .where(
          and(
            eq(schema.companyTable.id, user.companyId),
            eq(schema.companyTable.id, id)
          )
        );

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Successfully activate company!",
        },
        200
      );
    }
  )

  // Show companies
  .get("/list", async (c) => {
    const company = await db.query.companyTable.findMany();

    return c.json<SuccessResponse<Company[]>>({
      success: true,
      message: "Companies:",
      data: [...company],
    });
  })

  // Show company details
  .get("/", zValidator("query", Id), async (c) => {
    const { id } = c.req.valid("query");

    const company = await db.query.companyTable.findFirst({
      where: (company, { eq }) => eq(company.id, id),
    });
    if (!company) {
      throw new HTTPException(404, { message: "Company not found!" });
    }

    return c.json<SuccessResponse<Company>>({
      success: true,
      message: "Company Details",
      data: { ...company },
    });
  });

export default route;

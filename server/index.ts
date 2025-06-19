import { env } from "@/shared/env";
import type { ErrorResponse } from "@/shared/response";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ENV } from "./lib/env";
import { routes } from "./routes";

const app = new Hono<ENV>();

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json<ErrorResponse>(
        {
          success: false,
          error: err.message,
          isFormError:
            err.cause && typeof err.cause === "object" && "form" in err.cause
              ? err.cause.form === true
              : false,
        },
        err.status
      );
    return errResponse;
  }

  return c.json<ErrorResponse>(
    {
      success: false,
      error:
        env.NODE_ENV === "production"
          ? "Interal Server Error"
          : err.stack ?? err.message,
    },
    500
  );
});

export default app;

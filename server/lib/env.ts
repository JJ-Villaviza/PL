import type { Branch, Session } from "@/shared/types/schema";

export type ENV = {
  Variables: {
    user: Branch | null;
    session: Session | null;
  };
};

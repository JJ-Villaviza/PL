import authentication from "./authentication";
import branch from "./branch";
import company from "./company";

export const routes = [authentication, branch, company] as const;

import testUsersJson from "./data/test-users.json";

export type DevTestAccount = {
  email: string;
  password: string;
  name?: string;
  username?: string;
};

const isDevTestAccount = (value: unknown): value is DevTestAccount => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as DevTestAccount).email === "string" &&
    typeof (value as DevTestAccount).password === "string"
  );
};

export const getDevTestAccounts = (): DevTestAccount[] => {
  if (!Array.isArray(testUsersJson)) return [];
  return testUsersJson.filter(isDevTestAccount);
};

export const toBaseUsername = (email: string) => {
  const [localPart] = email.toLowerCase().split("@");
  const normalized = localPart.replace(/[^a-z0-9_]/g, "_").slice(0, 16);
  return `dev_${normalized || "user"}`;
};

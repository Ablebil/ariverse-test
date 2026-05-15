import { Prisma } from "@/app/generated/prisma/client";

export function serializeDecimal<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      value instanceof Prisma.Decimal ? value.toNumber() : value
    )
  );
}

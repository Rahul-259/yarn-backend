import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { db } from "./db";
import {
  customers,
  mainOrders,
  millInsertSchema,
  mills,
  orderInsertSchema,
} from "./db/schema";
import { zValidator } from "@hono/zod-validator";
import { productInsertSchema, products } from "./db/schema";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";

const app = new Hono();
app.use("/api/*", cors());
app.use(logger());

app
  .basePath("/api")
  .get("/", (c) => {
    return c.json({ message: "Hello Hono!" });
  })
  .get("/get-customers", async (c) => {
    const result = await db.select().from(customers);

    return c.json(result);
  })
  .post("/new-product", zValidator("form", productInsertSchema), async (c) => {
    const body = c.req.valid("form");

    // insert to db
    await db.insert(products).values(body);

    return c.json({ message: "Product added successfully!!" });
  })

  .post("/new-mill", zValidator("form", millInsertSchema), async (c) => {
    const body = c.req.valid("form");

    // insert to db
    await db.insert(mills).values(body);

    return c.json({ message: "New mill added successfully!!" });
  })
  .post(
    "/new-order",
    zValidator(
      "form",
      orderInsertSchema.extend({
        quantity: z.coerce.number(),
        remainingQuantity: z.coerce.number(),
        customerId: z.coerce.number(),
        productId: z.coerce.number(),
        millId: z.coerce.number(),
        totalAmount: z.coerce.number(),
      })
    ),
    async (c) => {
      const body = c.req.valid("form");

      // insert to db
      await db.insert(mainOrders).values(body);

      return c.json({ message: "New order added successfully!!" });
    }
  )
  .get("/get-products", async (c) => {
    const result = await db.select().from(products);

    return c.json(result);
  })
  .get("/get-mills", async (c) => {
    const result = await db.select().from(mills);

    return c.json(result);
  })
  .get("/get-orders", async (c) => {
    // const result = await db.select().from(mainOrders);
    const result = await db
      .select()
      .from(mainOrders)
      .innerJoin(customers, eq(customers.id, mainOrders.customerId))
      .innerJoin(products, eq(products.id, mainOrders.productId))
      .innerJoin(mills, eq(mills.id, mainOrders.millId));

    return c.json(result);
  })
  .patch(
    "/update-orders",
    zValidator(
      "json",
      z.object({
        orderId: z.number(),
        quantity: z.number(),
        rate: z.string(),
        status: z.string(),
        remainingQuantity: z.number(),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const result = await db
        .update(mainOrders)
        .set(body)
        .where(eq(mainOrders.id, body.orderId))
        .returning();

      return c.json(result);
    }
  )
  .get("/get-orders/:id", async (c) => {
    const id = c.req.param("id");
    const result = await db
      .select()
      .from(mainOrders)
      .where(eq(mainOrders.customerId, Number(id)))
      .innerJoin(customers, eq(customers.id, mainOrders.customerId))
      .innerJoin(products, eq(products.id, mainOrders.productId))
      .innerJoin(mills, eq(mills.id, mainOrders.millId));

    return c.json(result);
  });
app.use("*", serveStatic({ root: "../dist" }));
app.use("*", serveStatic({ path: "../dist/index.html" }));
export default { fetch: app.fetch, port: process.env.PORT || 5000 };

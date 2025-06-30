import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  date,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  creditLimit: integer("credit_limit").notNull(),
  outstandingAmount: integer("outstanding_amount").notNull(),
  address: text("address").notNull(),
});

// Mills
export const mills = pgTable("mills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
});
export const millInsertSchema = createInsertSchema(mills);

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const productInsertSchema = createInsertSchema(products);

// Main Orders
export const mainOrders = pgTable("main_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "cascade",
  }),
  // customerName: text("customer_name").notNull(),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  // productName: text("product_name").notNull(),
  millId: integer("mill_id").references(() => mills.id, {
    onDelete: "cascade",
  }),
  // millName: text("mill_name").notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: integer("total_amount").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").notNull(), // could use enum instead
});
export const orderInsertSchema = createInsertSchema(mainOrders);

// Delivery Orders
export const deliveryOrders = pgTable("delivery_orders", {
  id: serial("id").primaryKey(),
  mainOrderId: integer("main_order_id").references(() => mainOrders.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity").notNull(),
  deliveryDate: date("delivery_date").notNull(),
  status: text("status").notNull(),
  billId: integer("bill_id"),
  createdAt: timestamp("created_at").notNull(),
});

// Bills
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "cascade",
  }),
  customerName: text("customer_name").notNull(),
  mainOrderId: integer("main_order_id").references(() => mainOrders.id, {
    onDelete: "cascade",
  }),
  deliveryOrderId: integer("delivery_order_id").references(
    () => deliveryOrders.id,
    { onDelete: "cascade" }
  ),
  amount: integer("amount").notNull(),
  paidAmount: integer("paid_amount").notNull(),
  dueAmount: integer("due_amount").notNull(),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").notNull(),
  fileUrl: text("file_url"),
});

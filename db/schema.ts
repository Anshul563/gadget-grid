
// ----------------------------------------------------------------------
// 1. ENUMS

import { relations } from "drizzle-orm";
import { boolean, decimal, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ----------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);

// ----------------------------------------------------------------------
// 2. AUTH & USERS (Better-Auth Compatible)
// ----------------------------------------------------------------------
// src/db/schema.ts

// 1. Rename variable to 'user' (singular) to match your imports
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  
  // 2. Use 'text' for role instead of Enum to avoid Type errors with Better-Auth
  role: text("role").default("user"), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"), // For Email/Pass login
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// 4. VERIFICATION (For Email verification/Password Reset)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ----------------------------------------------------------------------
// 3. CATEGORY SYSTEM
// ----------------------------------------------------------------------

// Main Category (e.g., "Audio", "Power", "Wearables")
export const categories = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for URLs: /audio
  image: text("image"), // Category thumbnail
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sub Category (e.g., "Headphones", "Earbuds", "20000mAh Powerbanks")
export const subcategories = pgTable("subcategory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for URLs: /audio/headphones
  categoryId: integer("category_id").references(() => categories.id).notNull(), // Link to Parent
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ----------------------------------------------------------------------
// 4. PRODUCTS
// ----------------------------------------------------------------------
export const products = pgTable("product", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. "sony-xm5-headphones"
  description: text("description"),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }), // If null, no sale
  
  // Inventory
  stock: integer("stock").default(0).notNull(),
  sku: text("sku"), // Stock Keeping Unit
  
  // Categorization (Linked to Subcategory, which links to Category)
  subcategoryId: integer("subcategory_id").references(() => subcategories.id),
  
  // Media (Array of image URLs)
  images: jsonb("images").$type<string[]>().default([]),
  
  // Marketing
  isFeatured: boolean("is_featured").default(false), // Show on Home Banner?
  isNewArrival: boolean("is_new_arrival").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ----------------------------------------------------------------------
// 5. SALES & CART SYSTEM
// ----------------------------------------------------------------------

export const carts = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id), // Can be null for guest carts (optional)
  
  // Storing items as JSON is faster for simple carts. 
  // Structure: [{ productId: 1, quantity: 2, priceAtAdd: 999 }]
  items: jsonb("items").$type<{ productId: number; quantity: number; price: number }[]>().default([]),
  
  updatedAt: timestamp("updated_at").defaultNow(),
  reminderSent: boolean("reminder_sent").default(false), // For Abandoned Cart Microservice
});

export const coupons = pgTable("coupon", {
  code: text("code").primaryKey(), // e.g. "GADGET20"
  discountType: text("discount_type").notNull(), // "PERCENTAGE" or "FLAT"
  value: integer("value").notNull(), // 20 or 500
  minOrderValue: integer("min_order_value").default(0),
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"), // Max times this coupon can be used
  usedCount: integer("used_count").default(0),
  expiresAt: timestamp("expires_at"),
});

// ----------------------------------------------------------------------
// 6. ORDERS & CHECKOUT
// ----------------------------------------------------------------------

export const orders = pgTable("order", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  status: orderStatusEnum("status").default("pending"),
  
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  
  paymentId: text("razorpay_payment_id"),
  orderId: text("razorpay_order_id"),
  
  shippingAddress: jsonb("shipping_address").$type<{
    street: string; city: string; state: string; zip: string; phone: string 
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Separate table for Order Items (Better for analytics than JSON)
export const orderItems = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price at time of purchase
});

// ----------------------------------------------------------------------
// 7. RELATIONS (For easier Drizzle Queries)
// ----------------------------------------------------------------------

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
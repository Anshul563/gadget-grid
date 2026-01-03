// ----------------------------------------------------------------------
// 1. ENUMS

import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ----------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);

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
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
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
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(), // Link to Parent
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
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ----------------------------------------------------------------------
// 5. SALES & CART SYSTEM
// ----------------------------------------------------------------------

export const carts = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Nullable for guest carts
  sessionCartId: text("session_cart_id").notNull(), // A cookie ID for guests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlists = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Replace with UUID if your auth uses it
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  // Ensure a user can't duplicate the same product in wishlist
  unique: unique().on(t.userId, t.productId),
}));

export const coupons = pgTable("coupon", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. "GADGET20"
  discountType: text("discount_type").notNull(), // "PERCENTAGE" or "FLAT"
  value: integer("value").notNull(), // 20 or 500
  minOrderValue: integer("min_order_value").default(0),
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"), // Max times this coupon can be used
  usedCount: integer("used_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const banners = pgTable("banner", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Internal name e.g., "Diwali Sale Hero"
  imageUrl: text("image_url").notNull(), // URL to the image
  link: text("link"), // Where it redirects (e.g., "/collections/diwali")
  description: text("description"), // Alt text or subtitle
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0), // To control display order
  startDate: timestamp("start_date"), // Schedule start
  endDate: timestamp("end_date"), // Schedule end
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcements = pgTable("announcement", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  link: text("link"), // Optional URL to redirect to
  isActive: boolean("is_active").default(false),
  
  // Customization
  backgroundColor: text("background_color").default("#000000"), // Default Black
  textColor: text("text_color").default("#ffffff"), // Default White
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const addresses = pgTable("address", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(), // e.g. "Home", "Work"
  
  // Contact Info
  name: text("name").notNull(), // Good to have "Receiver Name"
  mobile: text("mobile").notNull(),
  altPhone: text("alt_phone"),

  // Address Info
  address: text("address").notNull(), // Street/Sector/Building
  landmark: text("landmark"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(), // Renamed from zip

  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ----------------------------------------------------------------------
// 6. ORDERS & CHECKOUT
// ----------------------------------------------------------------------

export const orders = pgTable("order", {
  id: serial("id").primaryKey(),
  
  // Link to User (Change to text("user_id") if you don't have a users table yet)
  userId: text("user_id").notNull(), 
  // If you have a users table: .references(() => users.id, { onDelete: "cascade" }),

  // --- STATUS TRACKING ---
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  paymentMethod: text("payment_method").default("cod").notNull(), // 'cod' or 'razorpay'

  // --- FINANCIALS ---
  // Store numbers as strings/decimals to avoid floating point math errors
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),

  // --- RAZORPAY INTEGRATION (Nullable because COD orders won't have these) ---
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpaySignature: text("razorpay_signature"),

  // --- ADDRESS SNAPSHOT ---
  // We store the full address object so it doesn't change if the user edits their profile later.
  shippingAddress: jsonb("shipping_address").$type<{
    name: string;
    mobile: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  }>().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Order Items (The actual products in the order)
export const orderItems = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  
  // Snapshot of price at time of purchase
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), 
});

// ----------------------------------------------------------------------
// 7. RELATIONS (For easier Drizzle Queries)
// ----------------------------------------------------------------------

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcategories.categoryId],
      references: [categories.id],
    }),
    products: many(products),
  })
);

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

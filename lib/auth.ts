import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Import your DB client
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", 
    schema: {
        ...schema // Pass your Drizzle schema
    }
  }),
  emailAndPassword: {  
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
});
import { auth } from "@/lib/auth"; // Import from step 3
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
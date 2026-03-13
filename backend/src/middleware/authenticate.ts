import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// supabaseAdmin is still used for DB queries (not for auth validation)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const DEV_USER_UUID = "00000000-0000-0000-0000-000000000001";

/**
 * Dummy authentication middleware.
 * No token validation — reads `x-user-id` header or falls back to a fixed dev UUID.
 * All requests are allowed through.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req.headers["x-user-id"] as string) || DEV_USER_UUID;
  req.userId = userId;
  req.userEmail = `dev@nuva.local`;
  next();
}

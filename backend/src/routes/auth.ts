import { Router, Request, Response } from "express";

const router = Router();

/**
 * Dummy OTP send — always succeeds without calling Supabase.
 */
router.post("/send-otp", async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  res.json({ message: "OTP sent successfully" });
});

/**
 * Dummy OTP verify — any token is accepted, returns a mock session.
 */
router.post("/verify-otp", async (req: Request, res: Response) => {
  const { phone, token } = req.body;

  if (!phone || !token) {
    res.status(400).json({ error: "Phone number and OTP code are required" });
    return;
  }

  const userId = "dev-" + phone.replace(/[^0-9]/g, "");

  const mockUser = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    phone,
    email: `${userId}@dev.local`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: { provider: "phone" },
    user_metadata: { phone },
  };

  const mockSession = {
    access_token: "dev-access-token",
    refresh_token: "dev-refresh-token",
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: "bearer",
    user: mockUser,
  };

  res.json({ session: mockSession, user: mockUser });
});

export default router;

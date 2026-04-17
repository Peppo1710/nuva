import { Router, Response } from "express";
import {
  authenticate,
  AuthenticatedRequest,
  supabaseAdmin,
} from "../middleware/authenticate";

const router = Router();

router.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", req.userId)
        .single();

      if (userError) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const { data: medical } = await supabaseAdmin
        .from("medical_profiles")
        .select("*")
        .eq("user_id", req.userId)
        .single();

      res.json({ profile: { ...user, medical: medical || null } });
    } catch {
      res
        .status(500)
        .json({ error: "Could not load profile. Please try again." });
    }
  }
);

router.put(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      username,
      age,
      gender,
      blood_group,
      weight_kg,
      height_cm,
      city,
      emergency_contact_name,
      emergency_contact_phone,
      theme_preference,
      avatar_url,
      language,
    } = req.body;

    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (username !== undefined) updateData.username = username;
      if (age !== undefined) updateData.age = age;
      if (gender !== undefined) updateData.gender = gender;
      if (blood_group !== undefined) updateData.blood_group = blood_group;
      if (weight_kg !== undefined) updateData.weight_kg = weight_kg;
      if (height_cm !== undefined) updateData.height_cm = height_cm;
      if (city !== undefined) updateData.city = city;
      if (emergency_contact_name !== undefined)
        updateData.emergency_contact_name = emergency_contact_name;
      if (emergency_contact_phone !== undefined)
        updateData.emergency_contact_phone = emergency_contact_phone;
      if (theme_preference !== undefined)
        updateData.theme_preference = theme_preference;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (language !== undefined) updateData.language = language;

      const { data, error } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("id", req.userId)
        .select()
        .single();

      if (error) {
        res
          .status(400)
          .json({ error: "Could not save changes. Please try again." });
        return;
      }

      res.json({ profile: data });
    } catch {
      res
        .status(500)
        .json({ error: "Could not save changes. Please try again." });
    }
  }
);

export default router;

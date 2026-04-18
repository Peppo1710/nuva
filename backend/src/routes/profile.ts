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
      phone,
      username,
      age,
      primary_goal,
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
      const fields: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (username !== undefined) fields.username = username;
      if (age !== undefined) fields.age = age;
      if (primary_goal !== undefined) fields.primary_goal = primary_goal;
      if (gender !== undefined) fields.gender = gender;
      if (blood_group !== undefined) fields.blood_group = blood_group;
      if (weight_kg !== undefined) fields.weight_kg = weight_kg;
      if (height_cm !== undefined) fields.height_cm = height_cm;
      if (city !== undefined) fields.city = city;
      if (emergency_contact_name !== undefined)
        fields.emergency_contact_name = emergency_contact_name;
      if (emergency_contact_phone !== undefined)
        fields.emergency_contact_phone = emergency_contact_phone;
      if (theme_preference !== undefined)
        fields.theme_preference = theme_preference;
      if (avatar_url !== undefined) fields.avatar_url = avatar_url;
      if (language !== undefined) fields.language = language;

      // Check if user already exists
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", req.userId)
        .maybeSingle();

      let data, error;

      if (!existing) {
        // First-time creation — phone is required
        const userPhone = phone || `+0${req.userId!.replace(/-/g, "").slice(-10)}`;
        ({ data, error } = await supabaseAdmin
          .from("users")
          .insert({ id: req.userId, phone: userPhone, ...fields })
          .select()
          .single());
      } else {
        ({ data, error } = await supabaseAdmin
          .from("users")
          .update(fields)
          .eq("id", req.userId)
          .select()
          .single());
      }

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

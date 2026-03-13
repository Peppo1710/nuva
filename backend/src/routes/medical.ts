import { Router, Response } from "express";
import {
  authenticate,
  AuthenticatedRequest,
  supabaseAdmin,
} from "../middleware/authenticate";

const router = Router();

router.get(
  "/history",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("medical_profiles")
        .select("*")
        .eq("user_id", req.userId)
        .single();

      if (error && error.code !== "PGRST116") {
        res
          .status(500)
          .json({
            error: "Could not load medical history. Please try again.",
          });
        return;
      }

      res.json({ medical: data || null });
    } catch {
      res
        .status(500)
        .json({ error: "Could not load medical history. Please try again." });
    }
  }
);

router.put(
  "/history",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      conditions,
      allergies,
      past_surgeries,
      doctor_name,
      doctor_specialty,
      doctor_phone,
      clinic_name,
      last_visit_date,
      insurance_number,
    } = req.body;

    try {
      const upsertData: Record<string, unknown> = {
        user_id: req.userId,
        updated_at: new Date().toISOString(),
      };

      if (conditions !== undefined) upsertData.conditions = conditions;
      if (allergies !== undefined) upsertData.allergies = allergies;
      if (past_surgeries !== undefined)
        upsertData.past_surgeries = past_surgeries;
      if (doctor_name !== undefined) upsertData.doctor_name = doctor_name;
      if (doctor_specialty !== undefined)
        upsertData.doctor_specialty = doctor_specialty;
      if (doctor_phone !== undefined) upsertData.doctor_phone = doctor_phone;
      if (clinic_name !== undefined) upsertData.clinic_name = clinic_name;
      if (last_visit_date !== undefined)
        upsertData.last_visit_date = last_visit_date;
      if (insurance_number !== undefined)
        upsertData.insurance_number = insurance_number;

      const { data, error } = await supabaseAdmin
        .from("medical_profiles")
        .upsert(upsertData, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        res
          .status(400)
          .json({
            error: "Could not save medical history. Please try again.",
          });
        return;
      }

      res.json({ medical: data });
    } catch {
      res
        .status(500)
        .json({ error: "Could not save medical history. Please try again." });
    }
  }
);

export default router;

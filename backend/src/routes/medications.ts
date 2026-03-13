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
      const { data, error } = await supabaseAdmin
        .from("medications")
        .select("*")
        .eq("user_id", req.userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        res
          .status(500)
          .json({ error: "Could not load medications. Please try again." });
        return;
      }

      res.json({ medications: data || [] });
    } catch {
      res
        .status(500)
        .json({ error: "Could not load medications. Please try again." });
    }
  }
);

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, dosage, frequency, instructions, source } = req.body;

    if (!name) {
      res.status(400).json({ error: "Medicine name is required" });
      return;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("medications")
        .insert({
          user_id: req.userId,
          name,
          dosage: dosage || null,
          frequency: frequency || null,
          instructions: instructions || null,
          source: source || "manual",
        })
        .select()
        .single();

      if (error) {
        res
          .status(400)
          .json({ error: "Could not add medication. Please try again." });
        return;
      }

      res.status(201).json({ medication: data });
    } catch {
      res
        .status(500)
        .json({ error: "Could not add medication. Please try again." });
    }
  }
);

router.put(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, dosage, frequency, instructions } = req.body;

    try {
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (dosage !== undefined) updateData.dosage = dosage;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (instructions !== undefined) updateData.instructions = instructions;

      const { data, error } = await supabaseAdmin
        .from("medications")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", req.userId)
        .select()
        .single();

      if (error) {
        res
          .status(400)
          .json({ error: "Could not update medication. Please try again." });
        return;
      }

      res.json({ medication: data });
    } catch {
      res
        .status(500)
        .json({ error: "Could not update medication. Please try again." });
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    try {
      const { error } = await supabaseAdmin
        .from("medications")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", req.userId);

      if (error) {
        res
          .status(400)
          .json({ error: "Could not remove medication. Please try again." });
        return;
      }

      res.json({ message: "Medication removed" });
    } catch {
      res
        .status(500)
        .json({ error: "Could not remove medication. Please try again." });
    }
  }
);

export default router;

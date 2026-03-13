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
        .from("reminders")
        .select("*")
        .eq("user_id", req.userId)
        .eq("is_active", true)
        .order("reminder_time", { ascending: true });

      if (error) {
        console.error("GET /reminders error:", error.message, error.code);
        res
          .status(500)
          .json({ error: "Could not load reminders. Please try again.", details: error.message });
        return;
      }

      res.json({ reminders: data || [] });
    } catch (err: unknown) {
      console.error("GET /reminders exception:", err);
      res
        .status(500)
        .json({ error: "Could not load reminders. Please try again." });
    }
  }
);

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      medicine_name,
      dose_amount,
      dose_unit,
      reminder_time,
      repeat_type,
      days_of_week,
      interval_hours,
      start_date,
      end_date,
      notes,
      medication_id,
    } = req.body;

    if (!medicine_name || !reminder_time) {
      res
        .status(400)
        .json({ error: "Medicine name and time are required." });
      return;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("reminders")
        .insert({
          user_id: req.userId,
          medication_id: medication_id || null,
          medicine_name,
          dose_amount: dose_amount || 1,
          dose_unit: dose_unit || "tablet",
          reminder_time,
          repeat_type: repeat_type || "daily",
          days_of_week: days_of_week || [0, 1, 2, 3, 4, 5, 6],
          interval_hours: interval_hours || null,
          start_date: start_date || null,
          end_date: end_date || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("POST /reminders error:", error.message, error.code);
        res
          .status(400)
          .json({ error: "Could not create reminder. Please try again.", details: error.message });
        return;
      }

      res.status(201).json({ reminder: data });
    } catch (err: unknown) {
      console.error("POST /reminders exception:", err);
      res
        .status(500)
        .json({ error: "Could not create reminder. Please try again." });
    }
  }
);

router.put(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      medicine_name,
      dose_amount,
      dose_unit,
      reminder_time,
      repeat_type,
      days_of_week,
      interval_hours,
      start_date,
      end_date,
      notes,
      expo_notification_id,
    } = req.body;

    try {
      const updateData: Record<string, unknown> = {};
      if (medicine_name !== undefined) updateData.medicine_name = medicine_name;
      if (dose_amount !== undefined) updateData.dose_amount = dose_amount;
      if (dose_unit !== undefined) updateData.dose_unit = dose_unit;
      if (reminder_time !== undefined) updateData.reminder_time = reminder_time;
      if (repeat_type !== undefined) updateData.repeat_type = repeat_type;
      if (days_of_week !== undefined) updateData.days_of_week = days_of_week;
      if (interval_hours !== undefined)
        updateData.interval_hours = interval_hours;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (notes !== undefined) updateData.notes = notes;
      if (expo_notification_id !== undefined)
        updateData.expo_notification_id = expo_notification_id;

      const { data, error } = await supabaseAdmin
        .from("reminders")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", req.userId)
        .select()
        .single();

      if (error) {
        console.error("PUT /reminders/:id error:", error.message, error.code);
        res
          .status(400)
          .json({ error: "Could not update reminder. Please try again.", details: error.message });
        return;
      }

      res.json({ reminder: data });
    } catch (err: unknown) {
      console.error("PUT /reminders/:id exception:", err);
      res
        .status(500)
        .json({ error: "Could not update reminder. Please try again." });
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
        .from("reminders")
        .delete()
        .eq("id", id)
        .eq("user_id", req.userId);

      if (error) {
        console.error("DELETE /reminders/:id error:", error.message, error.code);
        res
          .status(400)
          .json({ error: "Could not delete reminder. Please try again.", details: error.message });
        return;
      }

      res.json({ message: "Reminder deleted" });
    } catch (err: unknown) {
      console.error("DELETE /reminders/:id exception:", err);
      res
        .status(500)
        .json({ error: "Could not delete reminder. Please try again." });
    }
  }
);

router.post(
  "/:id/toggle",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { active } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("reminders")
        .update({ is_active: active })
        .eq("id", id)
        .eq("user_id", req.userId)
        .select()
        .single();

      if (error) {
        console.error("POST /reminders/:id/toggle error:", error.message, error.code);
        res
          .status(400)
          .json({ error: "Could not update reminder. Please try again.", details: error.message });
        return;
      }

      res.json({ reminder: data });
    } catch (err: unknown) {
      console.error("POST /reminders/:id/toggle exception:", err);
      res
        .status(500)
        .json({ error: "Could not update reminder. Please try again." });
    }
  }
);

router.get(
  "/today",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayStr = today.toISOString().split("T")[0];

      const { data: reminders, error } = await supabaseAdmin
        .from("reminders")
        .select("*")
        .eq("user_id", req.userId)
        .eq("is_active", true)
        .order("reminder_time", { ascending: true });

      if (error) {
        console.error("GET /reminders/today error:", error.message, error.code);
        res
          .status(500)
          .json({ error: "Could not load today's reminders. Please try again.", details: error.message });
        return;
      }

      const todayReminders = (reminders || []).filter((r) => {
        if (r.start_date && new Date(r.start_date) > today) return false;
        if (r.end_date && new Date(r.end_date) < today) return false;

        if (r.repeat_type === "daily") return true;
        if (r.repeat_type === "specific_days") {
          return r.days_of_week?.includes(dayOfWeek);
        }
        return true;
      });

      const { data: logs } = await supabaseAdmin
        .from("reminder_logs")
        .select("*")
        .eq("user_id", req.userId)
        .eq("scheduled_date", todayStr);

      const logMap = new Map(
        (logs || []).map((l) => [l.reminder_id, l])
      );

      const result = todayReminders.map((r) => ({
        ...r,
        log: logMap.get(r.id) || null,
      }));

      res.json({ reminders: result });
    } catch (err: unknown) {
      console.error("GET /reminders/today exception:", err);
      res
        .status(500)
        .json({ error: "Could not load today's reminders. Please try again." });
    }
  }
);

router.post(
  "/:id/taken",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const { data: existing } = await supabaseAdmin
        .from("reminder_logs")
        .select("*")
        .eq("reminder_id", id)
        .eq("user_id", req.userId)
        .eq("scheduled_date", todayStr)
        .single();

      if (existing) {
        const { data, error } = await supabaseAdmin
          .from("reminder_logs")
          .update({
            status: status || "taken",
            taken_at: status === "taken" ? new Date().toISOString() : null,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          res
            .status(400)
            .json({ error: "Could not update status. Please try again." });
          return;
        }
        res.json({ log: data });
      } else {
        const { data, error } = await supabaseAdmin
          .from("reminder_logs")
          .insert({
            reminder_id: id,
            user_id: req.userId,
            scheduled_date: todayStr,
            status: status || "taken",
            taken_at: status === "taken" ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) {
          res
            .status(400)
            .json({ error: "Could not update status. Please try again." });
          return;
        }
        res.status(201).json({ log: data });
      }
    } catch {
      res
        .status(500)
        .json({ error: "Could not update status. Please try again." });
    }
  }
);

router.get(
  "/streak",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data: reminders } = await supabaseAdmin
        .from("reminders")
        .select("id")
        .eq("user_id", req.userId)
        .eq("is_active", true);

      if (!reminders || reminders.length === 0) {
        res.json({ streak: 0 });
        return;
      }

      const reminderIds = reminders.map((r) => r.id);
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        if (i === 0) {
          // Today: partial — don't break if not all taken yet
          continue;
        }

        const { data: logs } = await supabaseAdmin
          .from("reminder_logs")
          .select("*")
          .in("reminder_id", reminderIds)
          .eq("scheduled_date", dateStr)
          .eq("status", "taken");

        if (logs && logs.length > 0) {
          streak++;
        } else {
          break;
        }
      }

      res.json({ streak });
    } catch {
      res.status(500).json({ error: "Could not load streak. Please try again." });
    }
  }
);

export default router;

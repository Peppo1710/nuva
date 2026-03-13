import { create } from "zustand";
import api from "@/lib/api";

export interface Surgery {
  name: string;
  year: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  source: string;
  is_active: boolean;
  created_at: string;
}

export interface MedicalProfile {
  conditions: string[];
  allergies: string[];
  past_surgeries: Surgery[];
  doctor_name: string | null;
  doctor_specialty: string | null;
  doctor_phone: string | null;
  clinic_name: string | null;
  last_visit_date: string | null;
  insurance_number: string | null;
}

interface MedicalState extends MedicalProfile {
  medications: Medication[];
  loading: boolean;
  saving: boolean;
  medicationsLoading: boolean;

  fetchMedicalHistory: () => Promise<void>;
  saveMedicalHistory: (
    data: Partial<MedicalProfile>
  ) => Promise<{ error: string | null }>;

  fetchMedications: () => Promise<void>;
  addMedication: (med: {
    name: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  }) => Promise<{ error: string | null }>;
  updateMedication: (
    id: string,
    data: Partial<Medication>
  ) => Promise<{ error: string | null }>;
  deleteMedication: (id: string) => Promise<{ error: string | null }>;

  addCondition: (condition: string) => Promise<{ error: string | null }>;
  removeCondition: (condition: string) => Promise<{ error: string | null }>;
  addAllergy: (allergy: string) => Promise<{ error: string | null }>;
  removeAllergy: (allergy: string) => Promise<{ error: string | null }>;
  addSurgery: (surgery: Surgery) => Promise<{ error: string | null }>;
  removeSurgery: (index: number) => Promise<{ error: string | null }>;

  reset: () => void;
}

const defaultMedical: MedicalProfile = {
  conditions: [],
  allergies: [],
  past_surgeries: [],
  doctor_name: null,
  doctor_specialty: null,
  doctor_phone: null,
  clinic_name: null,
  last_visit_date: null,
  insurance_number: null,
};

export const useMedicalStore = create<MedicalState>((set, get) => ({
  ...defaultMedical,
  medications: [],
  loading: false,
  saving: false,
  medicationsLoading: false,

  fetchMedicalHistory: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/medical/history");
      const medical = data.medical;
      if (medical) {
        set({
          conditions: medical.conditions || [],
          allergies: medical.allergies || [],
          past_surgeries: medical.past_surgeries || [],
          doctor_name: medical.doctor_name,
          doctor_specialty: medical.doctor_specialty,
          doctor_phone: medical.doctor_phone,
          clinic_name: medical.clinic_name,
          last_visit_date: medical.last_visit_date,
          insurance_number: medical.insurance_number,
          loading: false,
        });
      } else {
        set({ ...defaultMedical, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  saveMedicalHistory: async (data) => {
    set({ saving: true });
    try {
      const { data: responseData } = await api.put("/medical/history", data);
      const medical = responseData.medical;
      set({
        conditions: medical.conditions || [],
        allergies: medical.allergies || [],
        past_surgeries: medical.past_surgeries || [],
        doctor_name: medical.doctor_name,
        doctor_specialty: medical.doctor_specialty,
        doctor_phone: medical.doctor_phone,
        clinic_name: medical.clinic_name,
        last_visit_date: medical.last_visit_date,
        insurance_number: medical.insurance_number,
        saving: false,
      });
      return { error: null };
    } catch {
      set({ saving: false });
      return { error: "Could not save medical history. Please try again." };
    }
  },

  fetchMedications: async () => {
    set({ medicationsLoading: true });
    try {
      const { data } = await api.get("/medications");
      set({ medications: data.medications || [], medicationsLoading: false });
    } catch {
      set({ medicationsLoading: false });
    }
  },

  addMedication: async (med) => {
    try {
      const { data } = await api.post("/medications", med);
      set((state) => ({
        medications: [data.medication, ...state.medications],
      }));
      return { error: null };
    } catch {
      return { error: "Could not add medication. Please try again." };
    }
  },

  updateMedication: async (id, data) => {
    try {
      const { data: responseData } = await api.put(`/medications/${id}`, data);
      set((state) => ({
        medications: state.medications.map((m) =>
          m.id === id ? responseData.medication : m
        ),
      }));
      return { error: null };
    } catch {
      return { error: "Could not update medication. Please try again." };
    }
  },

  deleteMedication: async (id) => {
    try {
      await api.delete(`/medications/${id}`);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
      }));
      return { error: null };
    } catch {
      return { error: "Could not remove medication. Please try again." };
    }
  },

  addCondition: async (condition) => {
    const current = get().conditions;
    if (current.includes(condition)) return { error: null };
    const updated = [...current, condition];
    set({ conditions: updated });
    return get().saveMedicalHistory({ conditions: updated });
  },

  removeCondition: async (condition) => {
    const updated = get().conditions.filter((c) => c !== condition);
    set({ conditions: updated });
    return get().saveMedicalHistory({ conditions: updated });
  },

  addAllergy: async (allergy) => {
    const current = get().allergies;
    if (current.includes(allergy)) return { error: null };
    const updated = [...current, allergy];
    set({ allergies: updated });
    return get().saveMedicalHistory({ allergies: updated });
  },

  removeAllergy: async (allergy) => {
    const updated = get().allergies.filter((a) => a !== allergy);
    set({ allergies: updated });
    return get().saveMedicalHistory({ allergies: updated });
  },

  addSurgery: async (surgery) => {
    const updated = [...get().past_surgeries, surgery];
    set({ past_surgeries: updated });
    return get().saveMedicalHistory({ past_surgeries: updated });
  },

  removeSurgery: async (index) => {
    const updated = get().past_surgeries.filter((_, i) => i !== index);
    set({ past_surgeries: updated });
    return get().saveMedicalHistory({ past_surgeries: updated });
  },

  reset: () => {
    set({
      ...defaultMedical,
      medications: [],
      loading: false,
      saving: false,
      medicationsLoading: false,
    });
  },
}));

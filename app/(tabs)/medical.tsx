import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useMedicalStore, Surgery, Medication } from "@/store/medicalStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoChip } from "@/components/ui/NeoChip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

type SectionConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
};

const SECTION_CONFIG: Record<string, SectionConfig> = {
  conditions: { icon: "pulse-outline", gradientColors: ["#3DD6A3", "#2BC48A"] },
  medications: { icon: "medical-outline", gradientColors: ["#A594F9", "#7C6FEF"] },
  allergies: { icon: "alert-circle-outline", gradientColors: ["#F87171", "#EF4444"] },
  surgeries: { icon: "cut-outline", gradientColors: ["#60A5FA", "#3B82F6"] },
  doctor: { icon: "person-circle-outline", gradientColors: ["#FBBF24", "#F59E0B"] },
};

function SectionHeader({
  title,
  sectionKey,
  actionLabel,
  onAction,
  isDark,
  colors,
}: {
  title: string;
  sectionKey: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark: boolean;
  colors: typeof Colors.light;
}) {
  const config = SECTION_CONFIG[sectionKey] || SECTION_CONFIG.conditions;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          overflow: "hidden",
          marginRight: 12,
        }}
      >
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={config.icon} size={18} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.textPrimary, flex: 1 }}>
        {title}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: R.pill,
            borderWidth: 1,
            borderColor: isDark ? "rgba(61,214,163,0.3)" : colors.navy,
            backgroundColor: isDark ? "rgba(61,214,163,0.06)" : "transparent",
          }}
        >
          <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: isDark ? "#3DD6A3" : colors.navy }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function MedicalScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();

  const {
    conditions,
    allergies,
    past_surgeries,
    medications,
    doctor_name,
    doctor_specialty,
    doctor_phone,
    clinic_name,
    last_visit_date,
    insurance_number,
    loading,
    saving,
    medicationsLoading,
    fetchMedicalHistory,
    saveMedicalHistory,
    fetchMedications,
    addCondition,
    removeCondition,
    addAllergy,
    removeAllergy,
    addSurgery,
    removeSurgery,
    addMedication,
    deleteMedication,
  } = useMedicalStore();

  const [conditionInput, setConditionInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [showMedForm, setShowMedForm] = useState(false);
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [showDoctorEdit, setShowDoctorEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deletingMed, setDeletingMed] = useState<Medication | null>(null);
  const [deletingSurgeryIdx, setDeletingSurgeryIdx] = useState<number | null>(null);
  const [removingCondition, setRemovingCondition] = useState<string | null>(null);
  const [removingAllergy, setRemovingAllergy] = useState<string | null>(null);

  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
  });
  const [surgeryForm, setSurgeryForm] = useState({ name: "", year: "" });
  const [doctorForm, setDoctorForm] = useState({
    doctor_name: "",
    doctor_specialty: "",
    doctor_phone: "",
    clinic_name: "",
    last_visit_date: "",
    insurance_number: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchMedicalHistory(), fetchMedications()]);
      } catch {
        setError(t("common.error"));
      }
    };
    load();
  }, []);

  const handleAddCondition = useCallback(async () => {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;
    const { error: err } = await addCondition(trimmed);
    if (err) setError(err);
    setConditionInput("");
  }, [conditionInput, addCondition]);

  const handleAddAllergy = useCallback(async () => {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    const { error: err } = await addAllergy(trimmed);
    if (err) setError(err);
    setAllergyInput("");
  }, [allergyInput, addAllergy]);

  const handleAddMedication = useCallback(async () => {
    if (!medForm.name.trim()) {
      setError("Please enter the medicine name.");
      return;
    }
    const { error: err } = await addMedication({
      name: medForm.name.trim(),
      dosage: medForm.dosage.trim() || undefined,
      frequency: medForm.frequency.trim() || undefined,
      instructions: medForm.instructions.trim() || undefined,
    });
    if (err) {
      setError(err);
    } else {
      setMedForm({ name: "", dosage: "", frequency: "", instructions: "" });
      setShowMedForm(false);
    }
  }, [medForm, addMedication]);

  const confirmDeleteMedication = useCallback(async () => {
    if (!deletingMed) return;
    const { error: err } = await deleteMedication(deletingMed.id);
    if (err) setError(err);
    setDeletingMed(null);
  }, [deletingMed, deleteMedication]);

  const confirmDeleteSurgery = useCallback(async () => {
    if (deletingSurgeryIdx === null) return;
    const { error: err } = await removeSurgery(deletingSurgeryIdx);
    if (err) setError(err);
    setDeletingSurgeryIdx(null);
  }, [deletingSurgeryIdx, removeSurgery]);

  const confirmRemoveCondition = useCallback(async () => {
    if (!removingCondition) return;
    const { error: err } = await removeCondition(removingCondition);
    if (err) setError(err);
    setRemovingCondition(null);
  }, [removingCondition, removeCondition]);

  const confirmRemoveAllergy = useCallback(async () => {
    if (!removingAllergy) return;
    const { error: err } = await removeAllergy(removingAllergy);
    if (err) setError(err);
    setRemovingAllergy(null);
  }, [removingAllergy, removeAllergy]);

  const handleAddSurgery = useCallback(async () => {
    if (!surgeryForm.name.trim() || !surgeryForm.year.trim()) {
      setError("Please enter both the surgery name and year.");
      return;
    }
    const year = parseInt(surgeryForm.year, 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      setError("Please enter a valid year.");
      return;
    }
    const { error: err } = await addSurgery({
      name: surgeryForm.name.trim(),
      year,
    });
    if (err) {
      setError(err);
    } else {
      setSurgeryForm({ name: "", year: "" });
      setShowSurgeryForm(false);
    }
  }, [surgeryForm, addSurgery]);

  const handleSaveDoctorInfo = useCallback(async () => {
    const { error: err } = await saveMedicalHistory({
      doctor_name: doctorForm.doctor_name.trim() || null,
      doctor_specialty: doctorForm.doctor_specialty.trim() || null,
      doctor_phone: doctorForm.doctor_phone.trim() || null,
      clinic_name: doctorForm.clinic_name.trim() || null,
      last_visit_date: doctorForm.last_visit_date.trim() || null,
      insurance_number: doctorForm.insurance_number.trim() || null,
    });
    if (err) {
      setError(err);
    } else {
      setShowDoctorEdit(false);
    }
  }, [doctorForm, saveMedicalHistory]);

  const openDoctorEdit = useCallback(() => {
    setDoctorForm({
      doctor_name: doctor_name || "",
      doctor_specialty: doctor_specialty || "",
      doctor_phone: doctor_phone || "",
      clinic_name: clinic_name || "",
      last_visit_date: last_visit_date || "",
      insurance_number: insurance_number || "",
    });
    setShowDoctorEdit(true);
  }, [doctor_name, doctor_specialty, doctor_phone, clinic_name, last_visit_date, insurance_number]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#3DD6A3" : c.navy} />
        <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 16, fontWeight: "500" }}>
          Loading medical history...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: S.xl, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 6, letterSpacing: -0.5 }}>
          {t("medical.title")}
        </Text>
        <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.35)" : c.textMuted, marginBottom: 24, fontWeight: "500" }}>
          Your health records
        </Text>

        {error && (
          <View
            style={{
              marginBottom: 16,
              padding: S.base,
              borderWidth: 1,
              borderColor: isDark ? "rgba(248,113,113,0.2)" : "rgba(226,75,74,0.15)",
              borderRadius: R.lg,
              backgroundColor: isDark ? "rgba(248,113,113,0.06)" : "rgba(226,75,74,0.04)",
            }}
          >
            <Text style={{ fontSize: Typography.sm, color: c.danger, fontWeight: "500" }}>
              {error}
            </Text>
            <Pressable onPress={() => setError(null)} style={{ marginTop: 6 }}>
              <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.danger }}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Conditions */}
        <NeoCard style={{ marginBottom: 20 }}>
          <SectionHeader
            title={t("medical.conditions")}
            sectionKey="conditions"
            isDark={isDark}
            colors={c}
          />
          {conditions.length === 0 ? (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.25)" : c.textMuted, marginBottom: 12 }}>
              Tap + to add your conditions
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {conditions.map((cond) => (
                <NeoChip
                  key={cond}
                  label={cond}
                  variant="primary"
                  onRemove={() => setRemovingCondition(cond)}
                />
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <NeoInput
                value={conditionInput}
                onChangeText={setConditionInput}
                placeholder="e.g. Diabetes Type 2"
                onSubmitEditing={handleAddCondition}
                returnKeyType="done"
              />
            </View>
            <Pressable
              onPress={handleAddCondition}
              style={{
                width: 54,
                height: 54,
                borderRadius: R.md,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#3DD6A3", "#2BC48A"]}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: "#FFFFFF" }}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </NeoCard>

        {/* Medications */}
        <NeoCard style={{ marginBottom: 20 }}>
          <SectionHeader
            title={t("medical.medications")}
            sectionKey="medications"
            actionLabel="+ Add"
            onAction={() => setShowMedForm(true)}
            isDark={isDark}
            colors={c}
          />
          {medicationsLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={isDark ? "#3DD6A3" : c.navy} />
            </View>
          ) : medications.length === 0 ? (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.25)" : c.textMuted }}>
              Tap + Add to add your medications
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              {medications.map((med) => (
                <MedicationItemView
                  key={med.id}
                  medication={med}
                  onDelete={() => setDeletingMed(med)}
                  colors={c}
                  isDark={isDark}
                />
              ))}
            </View>
          )}
        </NeoCard>

        {/* Allergies */}
        <NeoCard style={{ marginBottom: 20 }}>
          <SectionHeader
            title={t("medical.allergies")}
            sectionKey="allergies"
            isDark={isDark}
            colors={c}
          />
          {allergies.length === 0 ? (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.25)" : c.textMuted, marginBottom: 12 }}>
              Tap + to add your allergies
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {allergies.map((a) => (
                <NeoChip
                  key={a}
                  label={a}
                  onRemove={() => setRemovingAllergy(a)}
                />
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <NeoInput
                value={allergyInput}
                onChangeText={setAllergyInput}
                placeholder="e.g. Penicillin"
                onSubmitEditing={handleAddAllergy}
                returnKeyType="done"
              />
            </View>
            <Pressable
              onPress={handleAddAllergy}
              style={{
                width: 54,
                height: 54,
                borderRadius: R.md,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#F87171", "#EF4444"]}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: "#FFFFFF" }}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </NeoCard>

        {/* Past Surgeries */}
        <NeoCard style={{ marginBottom: 20 }}>
          <SectionHeader
            title="Past Surgeries"
            sectionKey="surgeries"
            actionLabel="+ Add"
            onAction={() => setShowSurgeryForm(true)}
            isDark={isDark}
            colors={c}
          />
          {past_surgeries.length === 0 ? (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.25)" : c.textMuted }}>
              Tap + Add to add past surgeries
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              {past_surgeries.map((s: Surgery, index: number) => (
                <View
                  key={`${s.name}-${s.year}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isDark ? "#0D0D0D" : "#F7F8FA",
                    borderRadius: R.md,
                    padding: S.base,
                    borderWidth: 1,
                    borderColor: isDark ? "#1A1A1A" : c.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.textPrimary }}>
                      {s.name}
                    </Text>
                    <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 2 }}>
                      {s.year}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setDeletingSurgeryIdx(index)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: R.md,
                      backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(226,75,74,0.06)",
                    }}
                    hitSlop={8}
                  >
                    <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.danger }}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </NeoCard>

        {/* Doctor Information */}
        <NeoCard style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Doctor Information"
            sectionKey="doctor"
            actionLabel="Edit"
            onAction={openDoctorEdit}
            isDark={isDark}
            colors={c}
          />
          {!doctor_name && !doctor_specialty && !doctor_phone && !clinic_name ? (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.25)" : c.textMuted }}>
              Tap Edit to add your doctor's information
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              <DoctorField label="Doctor Name" value={doctor_name} colors={c} isDark={isDark} />
              <DoctorField label="Specialty" value={doctor_specialty} colors={c} isDark={isDark} />
              <DoctorField label="Phone" value={doctor_phone} colors={c} isDark={isDark} />
              <DoctorField label="Clinic" value={clinic_name} colors={c} isDark={isDark} />
              <DoctorField label="Last Visit" value={last_visit_date} colors={c} isDark={isDark} />
              <DoctorField label="Insurance #" value={insurance_number} colors={c} isDark={isDark} />
            </View>
          )}
        </NeoCard>
      </ScrollView>

      <FormModal
        visible={showMedForm}
        title="Add Medication"
        onClose={() => setShowMedForm(false)}
        colors={c}
        isDark={isDark}
      >
        <NeoInput label="Medicine Name" value={medForm.name} onChangeText={(t) => setMedForm({ ...medForm, name: t })} placeholder="e.g. Metformin" />
        <NeoInput label="Dosage" value={medForm.dosage} onChangeText={(t) => setMedForm({ ...medForm, dosage: t })} placeholder="e.g. 500mg" containerClassName="mt-4" />
        <NeoInput label="Frequency" value={medForm.frequency} onChangeText={(t) => setMedForm({ ...medForm, frequency: t })} placeholder="e.g. Twice daily" containerClassName="mt-4" />
        <NeoInput label="Instructions" value={medForm.instructions} onChangeText={(t) => setMedForm({ ...medForm, instructions: t })} placeholder="e.g. Take after food" containerClassName="mt-4" />
        <View style={{ marginTop: 24 }}>
          <NeoButton title="Add Medication" onPress={handleAddMedication} />
        </View>
      </FormModal>

      <FormModal
        visible={showSurgeryForm}
        title="Add Surgery"
        onClose={() => setShowSurgeryForm(false)}
        colors={c}
        isDark={isDark}
      >
        <NeoInput label="Surgery Name" value={surgeryForm.name} onChangeText={(t) => setSurgeryForm({ ...surgeryForm, name: t })} placeholder="e.g. Knee Replacement" />
        <NeoInput label="Year" value={surgeryForm.year} onChangeText={(t) => setSurgeryForm({ ...surgeryForm, year: t })} placeholder="e.g. 2020" keyboardType="number-pad" containerClassName="mt-4" />
        <View style={{ marginTop: 24 }}>
          <NeoButton title="Add Surgery" onPress={handleAddSurgery} />
        </View>
      </FormModal>

      <FormModal
        visible={showDoctorEdit}
        title="Doctor Information"
        onClose={() => setShowDoctorEdit(false)}
        colors={c}
        isDark={isDark}
      >
        <NeoInput label="Doctor Name" value={doctorForm.doctor_name} onChangeText={(t) => setDoctorForm({ ...doctorForm, doctor_name: t })} placeholder="Dr. Smith" />
        <NeoInput label="Specialty" value={doctorForm.doctor_specialty} onChangeText={(t) => setDoctorForm({ ...doctorForm, doctor_specialty: t })} placeholder="e.g. Cardiologist" containerClassName="mt-4" />
        <NeoInput label="Phone Number" value={doctorForm.doctor_phone} onChangeText={(t) => setDoctorForm({ ...doctorForm, doctor_phone: t })} placeholder="Doctor's phone" keyboardType="phone-pad" containerClassName="mt-4" />
        <NeoInput label="Clinic Name" value={doctorForm.clinic_name} onChangeText={(t) => setDoctorForm({ ...doctorForm, clinic_name: t })} placeholder="Clinic or hospital name" containerClassName="mt-4" />
        <NeoInput label="Last Visit Date" value={doctorForm.last_visit_date} onChangeText={(t) => setDoctorForm({ ...doctorForm, last_visit_date: t })} placeholder="YYYY-MM-DD" containerClassName="mt-4" />
        <NeoInput label="Insurance / Health Scheme #" value={doctorForm.insurance_number} onChangeText={(t) => setDoctorForm({ ...doctorForm, insurance_number: t })} placeholder="Optional" containerClassName="mt-4" />
        <View style={{ marginTop: 24, gap: 12 }}>
          <NeoButton title={saving ? "Saving..." : "Save Doctor Info"} onPress={handleSaveDoctorInfo} loading={saving} />
        </View>
      </FormModal>

      <ConfirmDialog
        visible={!!deletingMed}
        title="Remove Medication"
        message={`Are you sure you want to remove ${deletingMed?.name || "this medication"}?`}
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={confirmDeleteMedication}
        onCancel={() => setDeletingMed(null)}
        destructive
      />
      <ConfirmDialog
        visible={deletingSurgeryIdx !== null}
        title="Remove Surgery"
        message="Are you sure you want to remove this surgery record?"
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={confirmDeleteSurgery}
        onCancel={() => setDeletingSurgeryIdx(null)}
        destructive
      />
      <ConfirmDialog
        visible={!!removingCondition}
        title="Remove Condition"
        message={`Are you sure you want to remove "${removingCondition}"?`}
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={confirmRemoveCondition}
        onCancel={() => setRemovingCondition(null)}
        destructive
      />
      <ConfirmDialog
        visible={!!removingAllergy}
        title="Remove Allergy"
        message={`Are you sure you want to remove "${removingAllergy}"?`}
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={confirmRemoveAllergy}
        onCancel={() => setRemovingAllergy(null)}
        destructive
      />
    </SafeAreaView>
  );
}

const MedicationItemView = React.memo(function MedicationItemView({
  medication,
  onDelete,
  colors,
  isDark,
}: {
  medication: Medication;
  onDelete: () => void;
  colors: typeof Colors.light;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: isDark ? "#1A1A1A" : colors.border,
        padding: S.base,
        backgroundColor: isDark ? "#0D0D0D" : colors.surface,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          overflow: "hidden",
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <LinearGradient
          colors={["#A594F9", "#7C6FEF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 16 }}>💊</Text>
        </LinearGradient>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.textPrimary }}>
          {medication.name}
        </Text>
        {medication.dosage && (
          <Text style={{ fontSize: Typography.sm, color: colors.textSecondary, marginTop: 2 }}>
            {medication.dosage}
          </Text>
        )}
        {medication.frequency && (
          <Text style={{ fontSize: Typography.sm, color: colors.textSecondary }}>
            {medication.frequency}
          </Text>
        )}
        {medication.instructions && (
          <Text style={{ fontSize: Typography.sm, color: colors.textMuted, fontStyle: "italic", marginTop: 2 }}>
            {medication.instructions}
          </Text>
        )}
      </View>
      <Pressable
        onPress={onDelete}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: R.md,
          backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(226,75,74,0.06)",
        }}
        hitSlop={8}
      >
        <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: colors.danger }}>
          Remove
        </Text>
      </Pressable>
    </View>
  );
});

function DoctorField({
  label,
  value,
  colors,
  isDark,
}: {
  label: string;
  value: string | null;
  colors: typeof Colors.light;
  isDark: boolean;
}) {
  if (!value) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 40,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: isDark ? "#0D0D0D" : "#F7F8FA",
        borderRadius: R.md,
        borderWidth: 1,
        borderColor: isDark ? "#1A1A1A" : colors.border,
      }}
    >
      <Text style={{ fontSize: Typography.sm, color: colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: colors.textPrimary, flex: 1, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function FormModal({
  visible,
  title,
  onClose,
  children,
  colors,
  isDark,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  colors: typeof Colors.light;
  isDark: boolean;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: isDark ? "#0A0A0A" : colors.surface,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: "85%",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: isDark ? "#1A1A1A" : colors.border,
              borderBottomWidth: 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: S.xl,
                paddingTop: 24,
                paddingBottom: S.base,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#1A1A1A" : colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    overflow: "hidden",
                    marginRight: 12,
                  }}
                >
                  <LinearGradient
                    colors={["#3DD6A3", "#A594F9"]}
                    style={{ flex: 1 }}
                  />
                </View>
                <Text style={{ fontSize: Typography.md, fontWeight: "700", color: colors.textPrimary }}>
                  {title}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.textMuted }}>✕</Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={{ padding: S.xl }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

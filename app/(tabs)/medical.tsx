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
import { useMedicalStore, Surgery, Medication } from "@/store/medicalStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoChip } from "@/components/ui/NeoChip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

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
  const [deletingSurgeryIdx, setDeletingSurgeryIdx] = useState<number | null>(
    null
  );
  const [removingCondition, setRemovingCondition] = useState<string | null>(
    null
  );
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
  }, [
    doctor_name,
    doctor_specialty,
    doctor_phone,
    clinic_name,
    last_visit_date,
    insurance_number,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.navy} />
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 16 }}>
          Loading medical history...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: S.xl, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 24 }}>
          {t("medical.title")}
        </Text>

        {error && (
          <View
            style={{
              marginBottom: 16,
              padding: S.base,
              borderWidth: 0.5,
              borderColor: c.danger,
              borderRadius: R.md,
              backgroundColor: isDark ? "rgba(240,149,149,0.08)" : "rgba(226,75,74,0.06)",
            }}
          >
            <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500" }}>
              {error}
            </Text>
            <Pressable
              onPress={() => setError(null)}
              style={{ marginTop: 8, minHeight: 44, justifyContent: "center" }}
            >
              <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.danger, textDecorationLine: "underline" }}>
                Dismiss
              </Text>
            </Pressable>
          </View>
        )}

        <NeoCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              {t("medical.conditions")}
            </Text>
          </View>
          {conditions.length === 0 ? (
            <Text style={{ fontSize: Typography.base, color: c.textMuted, marginBottom: 12 }}>
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
                minWidth: 56,
                minHeight: 56,
                borderRadius: R.md,
                borderWidth: 0.5,
                borderColor: c.navy,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(26,39,68,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.navy }}>+</Text>
            </Pressable>
          </View>
        </NeoCard>

        <NeoCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              {t("medical.medications")}
            </Text>
            <Pressable
              onPress={() => setShowMedForm(true)}
              style={{
                minHeight: 44,
                borderRadius: R.pill,
                borderWidth: 1.5,
                borderColor: c.navy,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.navy }}>+ Add</Text>
            </Pressable>
          </View>
          {medicationsLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={c.navy} />
              <Text style={{ fontSize: Typography.base, color: c.textMuted, marginTop: 8 }}>
                Loading medications...
              </Text>
            </View>
          ) : medications.length === 0 ? (
            <Text style={{ fontSize: Typography.base, color: c.textMuted }}>
              Tap + Add to add your medications
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {medications.map((med) => (
                <MedicationItemView
                  key={med.id}
                  medication={med}
                  onDelete={() => setDeletingMed(med)}
                  colors={c}
                />
              ))}
            </View>
          )}
        </NeoCard>

        <NeoCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              {t("medical.allergies")}
            </Text>
          </View>
          {allergies.length === 0 ? (
            <Text style={{ fontSize: Typography.base, color: c.textMuted, marginBottom: 12 }}>
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
                minWidth: 56,
                minHeight: 56,
                borderRadius: R.md,
                borderWidth: 0.5,
                borderColor: c.navy,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(26,39,68,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.navy }}>+</Text>
            </Pressable>
          </View>
        </NeoCard>

        <NeoCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              Past Surgeries
            </Text>
            <Pressable
              onPress={() => setShowSurgeryForm(true)}
              style={{
                minHeight: 44,
                borderRadius: R.pill,
                borderWidth: 1.5,
                borderColor: c.navy,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.navy }}>+ Add</Text>
            </Pressable>
          </View>
          {past_surgeries.length === 0 ? (
            <Text style={{ fontSize: Typography.base, color: c.textMuted }}>
              Tap + Add to add past surgeries
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {past_surgeries.map((s: Surgery, index: number) => (
                <View
                  key={`${s.name}-${s.year}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 56,
                    borderBottomWidth: 0.5,
                    borderBottomColor: c.border,
                    paddingBottom: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: Typography.base, fontWeight: "500", color: c.textPrimary }}>
                      {s.name}
                    </Text>
                    <Text style={{ fontSize: Typography.base, color: c.textSecondary }}>
                      {s.year}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setDeletingSurgeryIdx(index)}
                    style={{ minWidth: 56, minHeight: 56, alignItems: "center", justifyContent: "center" }}
                    hitSlop={8}
                  >
                    <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.danger }}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </NeoCard>

        <NeoCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              Doctor Information
            </Text>
            <Pressable
              onPress={openDoctorEdit}
              style={{
                minHeight: 44,
                borderRadius: R.pill,
                borderWidth: 1.5,
                borderColor: c.navy,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.navy }}>Edit</Text>
            </Pressable>
          </View>
          {!doctor_name &&
          !doctor_specialty &&
          !doctor_phone &&
          !clinic_name ? (
            <Text style={{ fontSize: Typography.base, color: c.textMuted }}>
              Tap Edit to add your doctor's information
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              <DoctorField label="Doctor Name" value={doctor_name} colors={c} />
              <DoctorField label="Specialty" value={doctor_specialty} colors={c} />
              <DoctorField label="Phone" value={doctor_phone} colors={c} />
              <DoctorField label="Clinic" value={clinic_name} colors={c} />
              <DoctorField label="Last Visit" value={last_visit_date} colors={c} />
              <DoctorField label="Insurance #" value={insurance_number} colors={c} />
            </View>
          )}
        </NeoCard>
      </ScrollView>

      <FormModal
        visible={showMedForm}
        title="Add Medication"
        onClose={() => setShowMedForm(false)}
        colors={c}
      >
        <NeoInput
          label="Medicine Name"
          value={medForm.name}
          onChangeText={(t) => setMedForm({ ...medForm, name: t })}
          placeholder="e.g. Metformin"
        />
        <NeoInput
          label="Dosage"
          value={medForm.dosage}
          onChangeText={(t) => setMedForm({ ...medForm, dosage: t })}
          placeholder="e.g. 500mg"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Frequency"
          value={medForm.frequency}
          onChangeText={(t) => setMedForm({ ...medForm, frequency: t })}
          placeholder="e.g. Twice daily"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Instructions"
          value={medForm.instructions}
          onChangeText={(t) => setMedForm({ ...medForm, instructions: t })}
          placeholder="e.g. Take after food"
          containerClassName="mt-4"
        />
        <View style={{ marginTop: 24 }}>
          <NeoButton title="Add Medication" onPress={handleAddMedication} />
        </View>
      </FormModal>

      <FormModal
        visible={showSurgeryForm}
        title="Add Surgery"
        onClose={() => setShowSurgeryForm(false)}
        colors={c}
      >
        <NeoInput
          label="Surgery Name"
          value={surgeryForm.name}
          onChangeText={(t) => setSurgeryForm({ ...surgeryForm, name: t })}
          placeholder="e.g. Knee Replacement"
        />
        <NeoInput
          label="Year"
          value={surgeryForm.year}
          onChangeText={(t) => setSurgeryForm({ ...surgeryForm, year: t })}
          placeholder="e.g. 2020"
          keyboardType="number-pad"
          containerClassName="mt-4"
        />
        <View style={{ marginTop: 24 }}>
          <NeoButton title="Add Surgery" onPress={handleAddSurgery} />
        </View>
      </FormModal>

      <FormModal
        visible={showDoctorEdit}
        title="Doctor Information"
        onClose={() => setShowDoctorEdit(false)}
        colors={c}
      >
        <NeoInput
          label="Doctor Name"
          value={doctorForm.doctor_name}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, doctor_name: t })
          }
          placeholder="Dr. Smith"
        />
        <NeoInput
          label="Specialty"
          value={doctorForm.doctor_specialty}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, doctor_specialty: t })
          }
          placeholder="e.g. Cardiologist"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Phone Number"
          value={doctorForm.doctor_phone}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, doctor_phone: t })
          }
          placeholder="Doctor's phone"
          keyboardType="phone-pad"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Clinic Name"
          value={doctorForm.clinic_name}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, clinic_name: t })
          }
          placeholder="Clinic or hospital name"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Last Visit Date"
          value={doctorForm.last_visit_date}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, last_visit_date: t })
          }
          placeholder="YYYY-MM-DD"
          containerClassName="mt-4"
        />
        <NeoInput
          label="Insurance / Health Scheme #"
          value={doctorForm.insurance_number}
          onChangeText={(t) =>
            setDoctorForm({ ...doctorForm, insurance_number: t })
          }
          placeholder="Optional"
          containerClassName="mt-4"
        />
        <View style={{ marginTop: 24, gap: 12 }}>
          <NeoButton
            title={saving ? "Saving..." : "Save Doctor Info"}
            onPress={handleSaveDoctorInfo}
            loading={saving}
          />
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
}: {
  medication: Medication;
  onDelete: () => void;
  colors: typeof Colors.light;
}) {
  return (
    <View
      style={{
        borderRadius: R.lg,
        borderWidth: 0.5,
        borderColor: colors.border,
        padding: S.base,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.textPrimary }}>
            {medication.name}
          </Text>
          {medication.dosage && (
            <Text style={{ fontSize: Typography.base, color: colors.textSecondary, marginTop: 4 }}>
              {medication.dosage}
            </Text>
          )}
          {medication.frequency && (
            <Text style={{ fontSize: Typography.base, color: colors.textSecondary }}>
              {medication.frequency}
            </Text>
          )}
          {medication.instructions && (
            <Text style={{ fontSize: Typography.base, color: colors.textMuted, fontStyle: "italic", marginTop: 4 }}>
              {medication.instructions}
            </Text>
          )}
        </View>
        <Pressable
          onPress={onDelete}
          style={{ minWidth: 56, minHeight: 56, alignItems: "center", justifyContent: "center" }}
          hitSlop={8}
        >
          <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.danger }}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

function DoctorField({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | null;
  colors: typeof Colors.light;
}) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
      <Text style={{ fontSize: Typography.base, color: colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: Typography.base, fontWeight: "500", color: colors.textPrimary, flex: 1, textAlign: "right" }}>
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
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  colors: typeof Colors.light;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: "85%",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: S.xl,
                paddingTop: 32,
                paddingBottom: S.base,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: colors.textPrimary }}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                style={{ minWidth: 56, minHeight: 56, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: colors.textMuted }}>
                  ✕
                </Text>
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

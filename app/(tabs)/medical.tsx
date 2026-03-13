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
import { useMedicalStore, Surgery, Medication } from "@/store/medicalStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoChip } from "@/components/ui/NeoChip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function MedicalScreen() {
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
        setError("Could not load medical data. Please check your internet.");
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
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-4">
          Loading medical history...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-6">
          Medical History
        </Text>

        {error && (
          <View className="mb-4 p-4 border-2 border-error bg-error/10">
            <Text className="text-[18px] text-error font-medium">{error}</Text>
            <Pressable
              onPress={() => setError(null)}
              className="mt-2 min-h-[44px] justify-center"
            >
              <Text className="text-[18px] font-bold text-error underline">
                Dismiss
              </Text>
            </Pressable>
          </View>
        )}

        <NeoCard className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark">
              Current Conditions
            </Text>
          </View>
          {conditions.length === 0 ? (
            <Text className="text-[18px] text-gray-400 dark:text-gray-500 mb-3">
              Tap + to add your conditions
            </Text>
          ) : (
            <View className="flex-row flex-wrap mb-3">
              {conditions.map((c) => (
                <NeoChip
                  key={c}
                  label={c}
                  variant="primary"
                  onRemove={() => setRemovingCondition(c)}
                />
              ))}
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
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
              className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-primary bg-primary/10 items-center justify-center"
            >
              <Text className="text-[28px] font-bold text-primary">+</Text>
            </Pressable>
          </View>
        </NeoCard>

        <NeoCard className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark">
              Ongoing Medications
            </Text>
            <Pressable
              onPress={() => setShowMedForm(true)}
              className="min-h-[44px] rounded-full border-[1px] border-primary bg-primary/10 items-center justify-center px-4"
            >
              <Text className="text-[16px] font-bold text-primary">+ Add</Text>
            </Pressable>
          </View>
          {medicationsLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-[18px] text-gray-400 mt-2">
                Loading medications...
              </Text>
            </View>
          ) : medications.length === 0 ? (
            <Text className="text-[18px] text-gray-400 dark:text-gray-500">
              Tap + Add to add your medications
            </Text>
          ) : (
            <View className="gap-3">
              {medications.map((med) => (
                <MedicationItem
                  key={med.id}
                  medication={med}
                  onDelete={() => setDeletingMed(med)}
                />
              ))}
            </View>
          )}
        </NeoCard>

        <NeoCard className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark">
              Allergies
            </Text>
          </View>
          {allergies.length === 0 ? (
            <Text className="text-[18px] text-gray-400 dark:text-gray-500 mb-3">
              Tap + to add your allergies
            </Text>
          ) : (
            <View className="flex-row flex-wrap mb-3">
              {allergies.map((a) => (
                <NeoChip
                  key={a}
                  label={a}
                  onRemove={() => setRemovingAllergy(a)}
                />
              ))}
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
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
              className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-primary bg-primary/10 items-center justify-center"
            >
              <Text className="text-[28px] font-bold text-primary">+</Text>
            </Pressable>
          </View>
        </NeoCard>

        <NeoCard className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark">
              Past Surgeries
            </Text>
            <Pressable
              onPress={() => setShowSurgeryForm(true)}
              className="min-h-[44px] rounded-full border-[1px] border-primary bg-primary/10 items-center justify-center px-4"
            >
              <Text className="text-[16px] font-bold text-primary">+ Add</Text>
            </Pressable>
          </View>
          {past_surgeries.length === 0 ? (
            <Text className="text-[18px] text-gray-400 dark:text-gray-500">
              Tap + Add to add past surgeries
            </Text>
          ) : (
            <View className="gap-2">
              {past_surgeries.map((s: Surgery, index: number) => (
                <View
                  key={`${s.name}-${s.year}-${index}`}
                  className="flex-row items-center justify-between min-h-[56px] border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <View className="flex-1">
                    <Text className="text-[18px] font-medium text-navy dark:text-navy-dark">
                      {s.name}
                    </Text>
                    <Text className="text-[18px] text-gray-500 dark:text-gray-400">
                      {s.year}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setDeletingSurgeryIdx(index)}
                    className="min-w-[56px] min-h-[56px] items-center justify-center"
                    hitSlop={8}
                  >
                    <Text className="text-[18px] font-bold text-error">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </NeoCard>

        <NeoCard className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark">
              Doctor Information
            </Text>
            <Pressable
              onPress={openDoctorEdit}
              className="min-h-[44px] rounded-full border-[1px] border-primary dark:border-primary-dark bg-primary/10 items-center justify-center px-4"
            >
              <Text className="text-[16px] font-bold text-primary dark:text-primary-dark">Edit</Text>
            </Pressable>
          </View>
          {!doctor_name &&
          !doctor_specialty &&
          !doctor_phone &&
          !clinic_name ? (
            <Text className="text-[18px] text-gray-400 dark:text-gray-500">
              Tap Edit to add your doctor's information
            </Text>
          ) : (
            <View className="gap-2">
              <DoctorField label="Doctor Name" value={doctor_name} />
              <DoctorField label="Specialty" value={doctor_specialty} />
              <DoctorField label="Phone" value={doctor_phone} />
              <DoctorField label="Clinic" value={clinic_name} />
              <DoctorField label="Last Visit" value={last_visit_date} />
              <DoctorField label="Insurance #" value={insurance_number} />
            </View>
          )}
        </NeoCard>
      </ScrollView>

      <FormModal
        visible={showMedForm}
        title="Add Medication"
        onClose={() => setShowMedForm(false)}
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
        <View className="mt-6">
          <NeoButton title="Add Medication" onPress={handleAddMedication} />
        </View>
      </FormModal>

      <FormModal
        visible={showSurgeryForm}
        title="Add Surgery"
        onClose={() => setShowSurgeryForm(false)}
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
        <View className="mt-6">
          <NeoButton title="Add Surgery" onPress={handleAddSurgery} />
        </View>
      </FormModal>

      <FormModal
        visible={showDoctorEdit}
        title="Doctor Information"
        onClose={() => setShowDoctorEdit(false)}
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
        <View className="mt-6 gap-3">
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

const MedicationItem = React.memo(function MedicationItem({
  medication,
  onDelete,
}: {
  medication: Medication;
  onDelete: () => void;
}) {
  return (
    <View className="rounded-2xl border-[1px] border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-surface-dark shadow-sm mt-1 mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-[18px] font-bold text-navy dark:text-navy-dark">
            {medication.name}
          </Text>
          {medication.dosage && (
            <Text className="text-[18px] text-gray-600 dark:text-gray-400 mt-1">
              {medication.dosage}
            </Text>
          )}
          {medication.frequency && (
            <Text className="text-[18px] text-gray-600 dark:text-gray-400">
              {medication.frequency}
            </Text>
          )}
          {medication.instructions && (
            <Text className="text-[18px] text-gray-500 dark:text-gray-400 italic mt-1">
              {medication.instructions}
            </Text>
          )}
        </View>
        <Pressable
          onPress={onDelete}
          className="min-w-[56px] min-h-[56px] items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-[18px] font-bold text-error">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
});

function DoctorField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between items-center min-h-[44px]">
      <Text className="text-[18px] text-gray-500 dark:text-gray-400 flex-1">
        {label}
      </Text>
      <Text className="text-[18px] font-medium text-navy dark:text-navy-dark flex-1 text-right">
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
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-surface-dark rounded-t-[32px] max-h-[85%] overflow-hidden shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
            <View className="flex-row justify-between items-center px-6 pt-8 pb-4 border-b-[1px] border-gray-200 dark:border-gray-800">
              <Text className="text-[24px] font-bold text-navy dark:text-navy-dark">
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                className="min-w-[56px] min-h-[56px] items-center justify-center"
              >
                <Text className="text-[24px] font-bold text-gray-500 dark:text-gray-400">
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={{ padding: 24 }}
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

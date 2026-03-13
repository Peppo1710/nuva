import React from "react";
import { View, Text, ScrollView } from "react-native";
import { NeoButton } from "./NeoButton";

export interface DrugItem {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface PrescriptionCardProps {
  drugs: DrugItem[];
  onAddToMedications: (drugs: DrugItem[]) => void;
  onSetReminder: (drug: DrugItem) => void;
}

export const PrescriptionCard = React.memo(function PrescriptionCard({
  drugs,
  onAddToMedications,
  onSetReminder,
}: PrescriptionCardProps) {
  if (drugs.length === 0) return null;

  return (
    <View className="rounded-2xl overflow-hidden border-[1px] border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-soft mt-1 mb-4">
      <View className="bg-primary px-4 py-3">
        <Text className="text-[18px] font-bold text-white">
          Prescription Analysis
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="p-4">
          <View className="flex-row border-b-[1px] border-gray-200 dark:border-gray-700 pb-2 mb-2">
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark w-[120px]">
              Drug
            </Text>
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark w-[90px]">
              Dose
            </Text>
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark w-[100px]">
              Frequency
            </Text>
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark w-[140px]">
              Instructions
            </Text>
          </View>

          {drugs.map((drug, index) => (
            <View
              key={`${drug.name}-${index}`}
              className={`flex-row py-2 ${index < drugs.length - 1 ? "border-b-[1px] border-gray-100 dark:border-gray-800" : ""}`}
            >
              <Text className="text-[18px] text-navy dark:text-navy-dark font-semibold w-[120px]">
                {drug.name}
              </Text>
              <Text className="text-[18px] text-gray-700 dark:text-gray-300 w-[90px]">
                {drug.dosage}
              </Text>
              <Text className="text-[18px] text-gray-700 dark:text-gray-300 w-[100px]">
                {drug.frequency}
              </Text>
              <Text className="text-[18px] text-gray-700 dark:text-gray-300 w-[140px]">
                {drug.instructions}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-4 pb-4 pt-2">
        <View className="flex-1">
          <NeoButton
            title="Add to List"
            onPress={() => onAddToMedications(drugs)}
            variant="primary"
            className="min-h-[56px]"
          />
        </View>
        <View className="flex-1">
          <NeoButton
            title="Reminder"
            onPress={() => {
              if (drugs.length > 0) onSetReminder(drugs[0]);
            }}
            variant="accent"
            className="min-h-[56px]"
          />
        </View>
      </View>
    </View>
  );
});

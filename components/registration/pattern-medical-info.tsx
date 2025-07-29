"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrayInputField } from "./array-input-field";

interface PatientMedicalInfoProps {
  formData: {
    pastIllnesses: string[];
    chronicConditions: string[];
    surgeries: string[];
    allergies: string[];
    familyHistory: string;
    vaccinationRecords: string[];
  };
  onInputChange: (field: string, value: string) => void;
  onArrayAdd: (field: string, item: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

const commonIllnesses = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Migraine",
  "Allergic Rhinitis",
  "GERD",
];

const commonAllergies = [
  "Penicillin",
  "Aspirin",
  "Peanuts",
  "Shellfish",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Dust Mites",
  "Pollen",
];

const commonVaccinations = [
  "COVID-19",
  "Influenza",
  "Hepatitis B",
  "Tetanus",
  "MMR",
  "Polio",
  "Pneumococcal",
  "HPV",
  "Meningococcal",
  "Varicella",
];

const chronicConditionsSuggestions = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Disease",
];

export function PatientMedicalInfo({
  formData,
  onInputChange,
  onArrayAdd,
  onArrayRemove,
}: PatientMedicalInfoProps) {
  const handleAddPastIllness = useCallback(
    (item: string) => onArrayAdd("pastIllnesses", item),
    [onArrayAdd]
  );

  const handleRemovePastIllness = useCallback(
    (index: number) => onArrayRemove("pastIllnesses", index),
    [onArrayRemove]
  );

  const handleAddChronicCondition = useCallback(
    (item: string) => onArrayAdd("chronicConditions", item),
    [onArrayAdd]
  );

  const handleRemoveChronicCondition = useCallback(
    (index: number) => onArrayRemove("chronicConditions", index),
    [onArrayRemove]
  );

  const handleAddSurgery = useCallback(
    (item: string) => onArrayAdd("surgeries", item),
    [onArrayAdd]
  );

  const handleRemoveSurgery = useCallback(
    (index: number) => onArrayRemove("surgeries", index),
    [onArrayRemove]
  );

  const handleAddAllergy = useCallback(
    (item: string) => onArrayAdd("allergies", item),
    [onArrayAdd]
  );

  const handleRemoveAllergy = useCallback(
    (index: number) => onArrayRemove("allergies", index),
    [onArrayRemove]
  );

  const handleAddVaccination = useCallback(
    (item: string) => onArrayAdd("vaccinationRecords", item),
    [onArrayAdd]
  );

  const handleRemoveVaccination = useCallback(
    (index: number) => onArrayRemove("vaccinationRecords", index),
    [onArrayRemove]
  );

  return (
    <div className="space-y-6">
      <ArrayInputField
        label="Past Illnesses"
        placeholder="Add past illness"
        suggestions={commonIllnesses}
        items={formData.pastIllnesses}
        onAddItem={handleAddPastIllness}
        onRemoveItem={handleRemovePastIllness}
      />

      <ArrayInputField
        label="Chronic Conditions"
        placeholder="Add chronic condition"
        suggestions={chronicConditionsSuggestions}
        items={formData.chronicConditions}
        onAddItem={handleAddChronicCondition}
        onRemoveItem={handleRemoveChronicCondition}
      />

      <ArrayInputField
        label="Previous Surgeries"
        placeholder="Add surgery (e.g., Appendectomy 2020)"
        items={formData.surgeries}
        onAddItem={handleAddSurgery}
        onRemoveItem={handleRemoveSurgery}
      />

      <ArrayInputField
        label="Allergies"
        placeholder="Add allergy"
        suggestions={commonAllergies}
        items={formData.allergies}
        onAddItem={handleAddAllergy}
        onRemoveItem={handleRemoveAllergy}
      />

      <div className="space-y-2">
        <Label htmlFor="familyHistory">Family Medical History</Label>
        <Textarea
          id="familyHistory"
          value={formData.familyHistory}
          onChange={(e) => onInputChange("familyHistory", e.target.value)}
          placeholder="Describe any significant family medical history (e.g., diabetes in parents, heart disease in grandparents)"
          rows={3}
        />
      </div>

      <ArrayInputField
        label="Vaccination Records"
        placeholder="Add vaccination"
        suggestions={commonVaccinations}
        items={formData.vaccinationRecords}
        onAddItem={handleAddVaccination}
        onRemoveItem={handleRemoveVaccination}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Sore Throat",
  "Runny Nose",
  "Fatigue",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Stomach Pain",
  "Back Pain",
  "Chest Pain",
  "Shortness of Breath",
  "Dizziness",
  "Muscle Aches",
  "Joint Pain",
  "Rash",
  "Itching",
  "Sneezing",
  "Congestion",
  "Loss of Appetite",
  "Difficulty Sleeping",
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({
  selectedSymptoms,
  onSymptomsChange,
}: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSymptoms = commonSymptoms.filter(
    (symptom) =>
      symptom.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSymptoms.includes(symptom)
  );

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      onSymptomsChange([...selectedSymptoms, symptom]);
    }
  };

  const removeSymptom = (symptom: string) => {
    onSymptomsChange(selectedSymptoms.filter((s) => s !== symptom));
  };

  const addCustomSymptom = () => {
    if (searchTerm && !selectedSymptoms.includes(searchTerm)) {
      onSymptomsChange([...selectedSymptoms, searchTerm]);
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symptoms or add custom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          onKeyPress={(e) => e.key === "Enter" && addCustomSymptom()}
        />
        {searchTerm && (
          <Button
            size="sm"
            onClick={addCustomSymptom}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7"
          >
            Add
          </Button>
        )}
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <Badge key={symptom} variant="default" className="px-3 py-1">
                {symptom}
                <button
                  onClick={() => removeSymptom(symptom)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Common Symptoms */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Common Symptoms:</p>
        <div className="flex flex-wrap gap-2">
          {filteredSymptoms.slice(0, 20).map((symptom) => (
            <Button
              key={symptom}
              variant="outline"
              size="sm"
              onClick={() => addSymptom(symptom)}
              className="h-8"
            >
              {symptom}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

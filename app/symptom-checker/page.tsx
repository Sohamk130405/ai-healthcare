"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResultsSection } from "@/components/symptom-checker/results-section";
import { Stethoscope, AlertTriangle, Loader2, User } from "lucide-react";
import { Questionnaire } from "@/components/symptom-checker/questionnaire";
import { UserDetailContext } from "@/context/UserDetailContext";
import { getAgeFromDOB } from "@/lib/utils";

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Sore throat",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest pain",
  "Shortness of breath",
  "Abdominal pain",
  "Back pain",
  "Joint pain",
  "Skin rash",
  "Vomiting",
  "Diarrhea",
  "Runny nose",
  "Sneezing",
  "Muscle aches",
  "Loss of appetite",
  "Insomnia",
];

export default function SymptomCheckerPage() {
  const { userDetail } = useContext(UserDetailContext);
  const [age, setAge] = useState<number | string>(
    getAgeFromDOB(userDetail?.dateOfBirth || 21)
  );

  const [sex, setSex] = useState<string>(userDetail?.gender || "Male");
  const [symptomText, setSymptomText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [question, setQuestion] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiagnosisStarted, setIsDiagnosisStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 5;

  useEffect(() => {
    if (userDetail) {
      getAgeFromDOB(userDetail.dateOfBirth!);
      setSex(userDetail.gender);
    }
  }, [userDetail, getAgeFromDOB, setSex]);
  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
      // Add to symptom text if not already there
      if (!symptomText.toLowerCase().includes(symptom.toLowerCase())) {
        setSymptomText((prev) => (prev ? `${prev}, ${symptom}` : symptom));
      }
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    // Remove from symptom text
    const regex = new RegExp(`\\b${symptom}\\b,?\\s*`, "gi");
    setSymptomText((prev) =>
      prev.replace(regex, "").replace(/,\s*$/, "").replace(/^,\s*/, "")
    );
  };

  const handleSymptomTextChange = (value: string) => {
    setSymptomText(value);
    // Auto-detect symptoms from common list
    const detectedSymptoms = commonSymptoms.filter(
      (symptom) =>
        value.toLowerCase().includes(symptom.toLowerCase()) &&
        !selectedSymptoms.includes(symptom)
    );
    if (detectedSymptoms.length > 0) {
      setSelectedSymptoms((prev) => [...prev, ...detectedSymptoms]);
    }
  };

  const handleInitialSubmit = async () => {
    console.log(age);
    if (symptomText.trim().length === 0) {
      setError(
        "Please provide your age, sex, and a description of your symptoms."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestionCount(0);

    try {
      const response = await fetch("/api/symptom/parse-and-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: symptomText, age: Number(age), sex }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuestion(data.question);
        setEvidence(data.evidence || []);
        setIsDiagnosisStarted(true);
        if (data.question) {
          setQuestionCount(1);
        }
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (error) {
      setError("Failed to start diagnosis. Please try again later.");
    }
    setIsLoading(false);
  };

  const handleQuestionnaireSubmit = async (answers: any) => {
    setIsLoading(true);
    setError(null);
    const newEvidence = [...evidence, ...answers];
    setEvidence(newEvidence);

    if (questionCount >= MAX_QUESTIONS) {
      getFinalDiagnosis(newEvidence);
      return;
    }

    try {
      const response = await fetch("/api/symptom/continue-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: Number(age), sex, evidence: newEvidence }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.should_stop) {
          setResults(data);
          setQuestion(null);
        } else if (data.question) {
          setQuestion(data.question);
          setQuestionCount(questionCount + 1);
        } else {
          setResults(data);
          setQuestion(null);
        }
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (error) {
      setError("Failed to continue diagnosis. Please try again later.");
    }
    setIsLoading(false);
  };

  const getFinalDiagnosis = async (finalEvidence: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/symptom/continue-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(age),
          sex,
          evidence: finalEvidence,
          extras: { disable_groups: true },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
        setQuestion(null);
      } else {
        setError(
          data.error ||
            "An unknown error occurred while fetching final diagnosis."
        );
      }
    } catch (error) {
      setError("Failed to fetch final diagnosis. Please try again later.");
    }
    setIsLoading(false);
  };

  const resetDiagnosis = () => {
    setAge("");
    setSex("");
    setSymptomText("");
    setSelectedSymptoms([]);
    setEvidence([]);
    setQuestion(null);
    setResults(null);
    setError(null);
    setIsDiagnosisStarted(false);
    setQuestionCount(0);
  };

  const renderContent = () => {
    if (results) {
      return (
        <div className="space-y-6">
          <ResultsSection results={results} />
          <div className="text-center">
            <Button onClick={resetDiagnosis} variant="outline">
              Start New Diagnosis
            </Button>
          </div>
        </div>
      );
    }

    if (question) {
      return (
        <div className="space-y-6">
          {/* Progress indicator */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Diagnosis Progress</span>
                  <span className="text-muted-foreground">
                    Question {questionCount} of {MAX_QUESTIONS}
                  </span>
                </div>
                <Progress
                  value={(questionCount / MAX_QUESTIONS) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Questionnaire
            question={question}
            onSubmit={handleQuestionnaireSubmit}
            isLoading={isLoading}
            questionNumber={questionCount}
          />
        </div>
      );
    }

    if (!isDiagnosisStarted) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Symptom Description
              </CardTitle>
              <CardDescription>
                Describe your symptoms or select from common symptoms below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Selected Symptoms:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSymptom(symptom)}
                      >
                        {symptom} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptom Text Area */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">Describe Your Symptoms *</Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., 'I have a sore throat and a headache that started yesterday...'"
                  value={symptomText}
                  onChange={(e) => handleSymptomTextChange(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Common Symptoms */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Quick Add Common Symptoms:
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <Button
                      key={symptom}
                      variant={
                        selectedSymptoms.includes(symptom)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => addSymptom(symptom)}
                      disabled={selectedSymptoms.includes(symptom)}
                      className="text-xs h-8"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleInitialSubmit}
                disabled={symptomText.trim().length === 0 || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Diagnosis...
                  </>
                ) : (
                  "Start AI Diagnosis"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Symptom Analysis</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold">Symptom Checker</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered health insights through an interactive diagnosis
            process.
          </p>
        </div>

        {/* Medical Disclaimer */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Medical Disclaimer
                </p>
                <p className="text-sm text-amber-700">
                  This tool is for informational purposes only and is not a
                  substitute for professional medical advice. Always consult
                  with a healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    An Error Occurred
                  </p>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
}

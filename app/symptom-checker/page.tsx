"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SymptomSelector } from "@/components/symptom-checker/symptom-selector"
import { ResultsSection } from "@/components/symptom-checker/results-section"
import { Stethoscope, AlertTriangle } from "lucide-react"

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResults({
        conditions: [
          {
            name: "Common Cold",
            probability: 85,
            description: "A viral infection of the upper respiratory tract",
            severity: "Mild",
            specialists: ["General Practitioner", "ENT Specialist"],
          },
          {
            name: "Seasonal Allergies",
            probability: 65,
            description: "Allergic reaction to environmental allergens",
            severity: "Mild",
            specialists: ["Allergist", "General Practitioner"],
          },
          {
            name: "Sinusitis",
            probability: 45,
            description: "Inflammation of the sinus cavities",
            severity: "Moderate",
            specialists: ["ENT Specialist", "General Practitioner"],
          },
        ],
      })
      setIsLoading(false)
    }, 2000)
  }

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
            Describe your symptoms and get AI-powered insights about possible conditions and recommended specialists.
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">Medical Disclaimer</p>
                <p className="text-sm text-amber-700">
                  This tool is for informational purposes only and should not replace professional medical advice.
                  Always consult with a healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptom Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Symptoms</CardTitle>
            <CardDescription>Choose all symptoms you're currently experiencing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SymptomSelector selectedSymptoms={selectedSymptoms} onSymptomsChange={setSelectedSymptoms} />

            {selectedSymptoms.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Selected Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="px-3 py-1">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <Button
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Analyzing..." : "Analyze Symptoms"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && <ResultsSection results={results} />}
      </div>
    </div>
  )
}

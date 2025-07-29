"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Stethoscope,
  User,
  Sparkles,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal info (both)
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    gender: "",

    // Patient medical info
    pastIllnesses: [] as string[],
    chronicConditions: [] as string[],
    surgeries: [] as string[],
    allergies: [] as string[],
    familyHistory: "",
    vaccinationRecords: [] as string[],

    // Doctor professional info
    licenseNumber: "",
    specialization: "",
    experience: "",
    education: "",
    hospitalAffiliation: "",
    consultationFee: "",
    bio: "",
  });

  const [newItem, setNewItem] = useState({
    pastIllness: "",
    chronicCondition: "",
    surgery: "",
    allergy: "",
    vaccination: "",
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof typeof formData, item: string) => {
    if (item.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), item.trim()],
      }));
    }
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (step === 1 && userType) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    // Handle registration logic here
    console.log("Registration data:", { userType, ...formData });
  };

  const ArrayInputField = ({
    label,
    field,
    newItemKey,
    placeholder,
    suggestions = [],
  }: {
    label: string;
    field: keyof typeof formData;
    newItemKey: keyof typeof newItem;
    placeholder: string;
    suggestions?: string[];
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent"
                onClick={() => {
                  if (!(formData[field] as string[]).includes(suggestion)) {
                    addArrayItem(field, suggestion);
                  }
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newItem[newItemKey]}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, [newItemKey]: e.target.value }))
            }
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArrayItem(field, newItem[newItemKey]);
                setNewItem((prev) => ({ ...prev, [newItemKey]: "" }));
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              addArrayItem(field, newItem[newItemKey]);
              setNewItem((prev) => ({ ...prev, [newItemKey]: "" }));
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {(formData[field] as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData[field] as string[]).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Complete Your Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Set Up Your Account
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Complete your profile to get personalized healthcare experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= i
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded ${
                      step > i
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {step === 1 && "Choose Your Role"}
              {step === 2 && "Personal Information"}
              {step === 3 &&
                `${
                  userType === "patient" ? "Medical" : "Professional"
                } Information`}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1 &&
                "Select whether you're a patient or healthcare provider"}
              {step === 2 && "Please provide your personal information"}
              {step === 3 && `Complete your ${userType} profile`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all duration-300 card-hover ${
                    userType === "patient"
                      ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setUserType("patient")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Patient</h3>
                    <p className="text-gray-600 text-sm">
                      Get AI-powered health insights, book appointments, and
                      manage your healthcare
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-300 card-hover ${
                    userType === "doctor"
                      ? "ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-teal-50"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setUserType("doctor")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                      <Stethoscope className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Healthcare Provider
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Manage appointments, connect with patients, and provide
                      quality healthcare
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Patient Medical Information */}
            {step === 3 && userType === "patient" && (
              <div className="space-y-6">
                <ArrayInputField
                  label="Past Illnesses"
                  field="pastIllnesses"
                  newItemKey="pastIllness"
                  placeholder="Add past illness"
                  suggestions={commonIllnesses}
                />

                <ArrayInputField
                  label="Chronic Conditions"
                  field="chronicConditions"
                  newItemKey="chronicCondition"
                  placeholder="Add chronic condition"
                  suggestions={[
                    "Diabetes Type 1",
                    "Diabetes Type 2",
                    "Hypertension",
                    "Asthma",
                    "COPD",
                    "Heart Disease",
                  ]}
                />

                <ArrayInputField
                  label="Previous Surgeries"
                  field="surgeries"
                  newItemKey="surgery"
                  placeholder="Add surgery (e.g., Appendectomy 2020)"
                />

                <ArrayInputField
                  label="Allergies"
                  field="allergies"
                  newItemKey="allergy"
                  placeholder="Add allergy"
                  suggestions={commonAllergies}
                />

                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Family Medical History</Label>
                  <Textarea
                    id="familyHistory"
                    value={formData.familyHistory}
                    onChange={(e) =>
                      handleInputChange("familyHistory", e.target.value)
                    }
                    placeholder="Describe any significant family medical history (e.g., diabetes in parents, heart disease in grandparents)"
                    rows={3}
                  />
                </div>

                <ArrayInputField
                  label="Vaccination Records"
                  field="vaccinationRecords"
                  newItemKey="vaccination"
                  placeholder="Add vaccination"
                  suggestions={commonVaccinations}
                />
              </div>
            )}

            {/* Step 3: Doctor Professional Information */}
            {step === 3 && userType === "doctor" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">
                      Medical License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        handleInputChange("licenseNumber", e.target.value)
                      }
                      placeholder="Enter your license number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) =>
                        handleInputChange("specialization", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General Practitioner
                        </SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="gynecology">Gynecology</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="anesthesiology">
                          Anesthesiology
                        </SelectItem>
                        <SelectItem value="emergency">
                          Emergency Medicine
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      placeholder="Years of practice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">
                      Consultation Fee ($)
                    </Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      value={formData.consultationFee}
                      onChange={(e) =>
                        handleInputChange("consultationFee", e.target.value)
                      }
                      placeholder="Consultation fee"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education & Qualifications</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                    placeholder="Medical degree, certifications, fellowships"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalAffiliation">
                    Hospital/Clinic Affiliation
                  </Label>
                  <Input
                    id="hospitalAffiliation"
                    value={formData.hospitalAffiliation}
                    onChange={(e) =>
                      handleInputChange("hospitalAffiliation", e.target.value)
                    }
                    placeholder="Current workplace or affiliation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Brief professional biography and areas of expertise"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            {step === 3 && (
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 bg-transparent hover:bg-gray-50"
                >
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !userType}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Complete Profile
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-gray-600">
                Need help?{" "}
                <Link
                  href="/support"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

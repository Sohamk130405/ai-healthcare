"use client";

import { useState, useCallback, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserPlus, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressIndicator } from "@/components/registration/progress-indicator";
import { UserTypeSelector } from "@/components/registration/user-type-selection";
import { PersonalInfoForm } from "@/components/registration/personal-info-form";
import { PatientMedicalInfo } from "@/components/registration/pattern-medical-info";
import { DoctorProfessionalInfo } from "@/components/registration/doctor-professional-info";
import { toast } from "sonner";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Role, UserDetail } from "../provider";

export default function RegisterPage() {
  const { setUserDetail } = useContext(UserDetailContext);
  const [userType, setUserType] = useState<Role | null>(null);
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

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayAdd = useCallback((field: string, item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), item],
    }));
  }, []);

  const handleArrayRemove = useCallback((field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(
        (_, i) => i !== index
      ),
    }));
  }, []);

  const handleNext = () => {
    if (step === 1 && userType) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/profile/complete", {
        userType,
        ...formData,
      });
      if (res.status === 200 && res.data.success) {
        setUserDetail(
          (prev) =>
            ({
              ...prev,
              isProfileCompleted: true,
              role: userType,
            } as UserDetail)
        );
        toast.success("Profile completed successfully!");
        console.log("Registration data:", { userType, ...formData });
      } else {
        toast.error(res.data.error || "Failed to complete profile");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Choose Your Role";
      case 2:
        return "Personal Information";
      case 3:
        return `${
          userType === "patient" ? "Medical" : "Professional"
        } Information`;
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Select whether you're a patient or healthcare provider";
      case 2:
        return "Please provide your personal information";
      case 3:
        return `Complete your ${userType} profile`;
      default:
        return "";
    }
  };

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
        <ProgressIndicator currentStep={step} totalSteps={3} />

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
            <CardDescription className="text-base">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <UserTypeSelector
                userType={userType}
                onUserTypeChange={setUserType}
              />
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <PersonalInfoForm
                formData={{
                  phone: formData.phone,
                  dateOfBirth: formData.dateOfBirth,
                  address: formData.address,
                  city: formData.city,
                  gender: formData.gender,
                }}
                onInputChange={handleInputChange}
              />
            )}

            {/* Step 3: Patient Medical Information */}
            {step === 3 && userType === "patient" && (
              <PatientMedicalInfo
                formData={{
                  pastIllnesses: formData.pastIllnesses,
                  chronicConditions: formData.chronicConditions,
                  surgeries: formData.surgeries,
                  allergies: formData.allergies,
                  familyHistory: formData.familyHistory,
                  vaccinationRecords: formData.vaccinationRecords,
                }}
                onInputChange={handleInputChange}
                onArrayAdd={handleArrayAdd}
                onArrayRemove={handleArrayRemove}
              />
            )}

            {/* Step 3: Doctor Professional Information */}
            {step === 3 && userType === "doctor" && (
              <DoctorProfessionalInfo
                formData={{
                  licenseNumber: formData.licenseNumber,
                  specialization: formData.specialization,
                  experience: formData.experience,
                  education: formData.education,
                  hospitalAffiliation: formData.hospitalAffiliation,
                  consultationFee: formData.consultationFee,
                  bio: formData.bio,
                }}
                onInputChange={handleInputChange}
              />
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

"use client";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    available: boolean;
  };
}

interface DoctorProfessionalInfoProps {
  formData: {
    licenseNumber: string;
    specialization: string;
    qualifications: string;
    consultationFee: string;
    workingHours: WorkingHours;
  };
  onInputChange: (field: string, value: string | WorkingHours) => void;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

export function DoctorProfessionalInfo({
  formData,
  onInputChange,
}: DoctorProfessionalInfoProps) {
  const handleWorkingHoursChange = (
    day: string,
    field: "start" | "end" | "available",
    value: string | boolean
  ) => {
    const updatedHours = {
      ...formData.workingHours,
      [day]: {
        ...formData.workingHours[day],
        [field]: value,
      },
    };
    onInputChange("workingHours", updatedHours);
  };

  // Initialize working hours if not set
  if (
    !formData.workingHours ||
    Object.keys(formData.workingHours).length === 0
  ) {
    const defaultWorkingHours: WorkingHours = {};
    DAYS_OF_WEEK.forEach((day) => {
      defaultWorkingHours[day.key] = {
        start: "09:00",
        end: "17:00",
        available: day.key !== "sunday",
      };
    });
    onInputChange("workingHours", defaultWorkingHours);
  }

  return (
    <div className="space-y-6">
      {/* Basic Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Information</CardTitle>
          <CardDescription>
            Enter your medical credentials and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Medical License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => onInputChange("licenseNumber", e.target.value)}
                placeholder="Enter your license number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) =>
                  onInputChange("specialization", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Practice">
                    General Practice
                  </SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="Gynecology">Gynecology</SelectItem>
                  <SelectItem value="Oncology">Oncology</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Anesthesiology">Anesthesiology</SelectItem>
                  <SelectItem value="Emergency Medicine">
                    Emergency Medicine
                  </SelectItem>
                  <SelectItem value="Internal Medicine">
                    Internal Medicine
                  </SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="ENT">ENT (Ear, Nose, Throat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications *</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => onInputChange("qualifications", e.target.value)}
              placeholder="e.g., MD, MBBS, Board Certifications, Fellowships"
              rows={3}
              required
            />
            <p className="text-sm text-gray-500">
              List your medical degree, board certifications, and any
              fellowships
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">Consultation Fee (INR) *</Label>
            <Input
              id="consultationFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.consultationFee}
              onChange={(e) => onInputChange("consultationFee", e.target.value)}
              placeholder="Enter consultation fee"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Working Hours</CardTitle>
          <CardDescription>
            Set your availability for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.key}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <div className="w-24">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${day.key}-available`}
                      checked={
                        formData.workingHours[day.key]?.available || false
                      }
                      onCheckedChange={(checked) =>
                        handleWorkingHoursChange(
                          day.key,
                          "available",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`${day.key}-available`}
                      className="font-medium"
                    >
                      {day.label}
                    </Label>
                  </div>
                </div>

                {formData.workingHours[day.key]?.available && (
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Start Time
                      </Label>
                      <Select
                        value={formData.workingHours[day.key]?.start || "09:00"}
                        onValueChange={(value) =>
                          handleWorkingHoursChange(day.key, "start", value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <span className="text-gray-400 mt-5">to</span>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">End Time</Label>
                      <Select
                        value={formData.workingHours[day.key]?.end || "17:00"}
                        onValueChange={(value) =>
                          handleWorkingHoursChange(day.key, "end", value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!formData.workingHours[day.key]?.available && (
                  <div className="flex-1 text-gray-400 text-sm">
                    Not available
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Patients will be able to book appointments
              during your available hours. You can modify these settings later
              from your profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

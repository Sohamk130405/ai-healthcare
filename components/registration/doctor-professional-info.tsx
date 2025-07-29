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

interface DoctorProfessionalInfoProps {
  formData: {
    licenseNumber: string;
    specialization: string;
    experience: string;
    education: string;
    hospitalAffiliation: string;
    consultationFee: string;
    bio: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function DoctorProfessionalInfo({
  formData,
  onInputChange,
}: DoctorProfessionalInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">Medical License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => onInputChange("licenseNumber", e.target.value)}
            placeholder="Enter your license number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => onInputChange("specialization", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Practitioner</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="dermatology">Dermatology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="psychiatry">Psychiatry</SelectItem>
              <SelectItem value="gynecology">Gynecology</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="anesthesiology">Anesthesiology</SelectItem>
              <SelectItem value="emergency">Emergency Medicine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            type="number"
            value={formData.experience}
            onChange={(e) => onInputChange("experience", e.target.value)}
            placeholder="Years of practice"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
          <Input
            id="consultationFee"
            type="number"
            value={formData.consultationFee}
            onChange={(e) => onInputChange("consultationFee", e.target.value)}
            placeholder="Consultation fee"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="education">Education & Qualifications</Label>
        <Textarea
          id="education"
          value={formData.education}
          onChange={(e) => onInputChange("education", e.target.value)}
          placeholder="Medical degree, certifications, fellowships"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hospitalAffiliation">Hospital/Clinic Affiliation</Label>
        <Input
          id="hospitalAffiliation"
          value={formData.hospitalAffiliation}
          onChange={(e) => onInputChange("hospitalAffiliation", e.target.value)}
          placeholder="Current workplace or affiliation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onInputChange("bio", e.target.value)}
          placeholder="Brief professional biography and areas of expertise"
          rows={4}
        />
      </div>
    </div>
  );
}

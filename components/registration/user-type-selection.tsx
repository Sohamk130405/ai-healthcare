"use client";

import { Role } from "@/app/provider";
import { Card, CardContent } from "@/components/ui/card";
import { User, Stethoscope } from "lucide-react";

interface UserTypeSelectorProps {
  userType: Role | null;
  onUserTypeChange: (type: Role) => void;
}

export function UserTypeSelector({
  userType,
  onUserTypeChange,
}: UserTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        className={`cursor-pointer transition-all duration-300 card-hover ${
          userType === Role.PATIENT
            ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50"
            : "hover:shadow-lg"
        }`}
        onClick={() => onUserTypeChange(Role.PATIENT)}
      >
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Patient</h3>
          <p className="text-gray-600 text-sm">
            Get AI-powered health insights, book appointments, and manage your
            healthcare
          </p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all duration-300 card-hover ${
          userType === Role.DOCTOR
            ? "ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-teal-50"
            : "hover:shadow-lg"
        }`}
        onClick={() => onUserTypeChange(Role.DOCTOR)}
      >
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Healthcare Provider</h3>
          <p className="text-gray-600 text-sm">
            Manage appointments, connect with patients, and provide quality
            healthcare
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

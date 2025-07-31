"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  Award,
  Phone,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  consultationFee: number;
  workingHours: {
    monday?: { start: string; end: string; available: boolean };
    tuesday?: { start: string; end: string; available: boolean };
    wednesday?: { start: string; end: string; available: boolean };
    thursday?: { start: string; end: string; available: boolean };
    friday?: { start: string; end: string; available: boolean };
    saturday?: { start: string; end: string; available: boolean };
    sunday?: { start: string; end: string; available: boolean };
  };
  phoneNumber?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  image?: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  filters: {
    specialization: string;
    location: string;
    consultationType: string;
    availability: string;
    rating: number;
  };
  onBookAppointment: (doctor: Doctor) => void;
}

export function DoctorList({
  doctors,
  filters,
  onBookAppointment,
}: DoctorListProps) {
  const filteredDoctors = doctors.filter((doctor) => {
    if (
      filters.specialization &&
      doctor.specialization !== filters.specialization
    )
      return false;
    if (
      filters.location &&
      doctor.city &&
      !doctor.city.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.rating && doctor.rating && doctor.rating < filters.rating)
      return false;
    return true;
  });

  const getAvailableDays = (workingHours: Doctor["workingHours"]) => {
    const days = Object.keys(workingHours).filter(
      (day) => workingHours[day as keyof typeof workingHours]?.available
    );
    return days.length > 0 ? days.join(", ") : "Contact for availability";
  };

  const getNextAvailableSlot = (workingHours: Doctor["workingHours"]) => {
    const today = new Date().getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      const dayName = dayNames[dayIndex] as keyof typeof workingHours;
      const daySchedule = workingHours[dayName];

      if (daySchedule?.available) {
        const dayLabel =
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return `${dayLabel} at ${daySchedule.start}`;
      }
    }
    return "Contact for availability";
  };

  return (
    <div className="space-y-4">
      {filteredDoctors.map((doctor) => (
        <Card
          key={doctor.email}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Doctor Info */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0 flex-shrink-0">
                  <AvatarImage
                    src={doctor.image || "/placeholder.svg?height=80&width=80"}
                    alt={doctor.name}
                  />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      Dr. {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {doctor.specialization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                    {doctor.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                        <span className="font-medium">{doctor.rating}</span>
                        {doctor.reviewCount && (
                          <span className="ml-1">
                            ({doctor.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>License: {doctor.licenseNumber}</span>
                    </div>
                    {doctor.city && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{doctor.city}</span>
                      </div>
                    )}
                  </div>

                  {doctor.qualifications && (
                    <div className="text-sm text-gray-600">
                      <strong>Qualifications:</strong> {doctor.qualifications}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {getAvailableDays(doctor.workingHours)}
                    </Badge>
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">
                      {doctor.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Section */}
              <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[200px]">
                <div className="text-center lg:text-right">
                  <div className="flex items-center justify-center lg:justify-end gap-1">
                    <IndianRupee className="h-5 w-5 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {doctor.consultationFee}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:w-full max-w-xs">
                  <Button
                    onClick={() => onBookAppointment(doctor)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>

                <div className="text-center lg:text-right">
                  <p className="text-xs text-gray-500 mb-1">Next Available:</p>
                  <p className="text-sm font-medium text-green-600">
                    {getNextAvailableSlot(doctor.workingHours)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Bio */}
            {doctor.bio && (
              <div className="sm:hidden mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  {doctor.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No doctors found matching your criteria.
            </p>
            <p className="text-sm text-gray-400">
              Try adjusting your filters to see more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

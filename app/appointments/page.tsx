"use client";

import { useState, useEffect } from "react";
import { DoctorList } from "@/components/appointments/doctor-list";
import { AppointmentFilters } from "@/components/appointments/appointment-filters";
import { BookingModal } from "@/components/appointments/booking-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

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
}

export default function AppointmentsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    availability: "",
    rating: 0,
    consultationType: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/doctors");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      } else {
        console.error("Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
      <div className="container py-8 mx-auto max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Book Your Appointment
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Book an Appointment
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find and book appointments with qualified healthcare professionals
              in your area.
            </p>
          </div>

          {/* Filters */}
          <AppointmentFilters filters={filters} onFiltersChange={setFilters} />

          {/* Doctor List */}
          {loading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Loading doctors...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DoctorList
              doctors={doctors}
              filters={filters}
              onBookAppointment={handleBookAppointment}
            />
          )}

          {/* Booking Modal */}
          {selectedDoctor && (
            <BookingModal
              doctor={selectedDoctor}
              open={!!selectedDoctor}
              onClose={() => setSelectedDoctor(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

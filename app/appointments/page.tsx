"use client"

import { useState } from "react"
import { DoctorList } from "@/components/appointments/doctor-list"
import { AppointmentFilters } from "@/components/appointments/appointment-filters"
import { BookingModal } from "@/components/appointments/booking-modal"

export default function AppointmentsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    availability: "",
    rating: 0,
  })

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold">Book an Appointment</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find and book appointments with qualified healthcare professionals in your area.
          </p>
        </div>

        {/* Filters */}
        <AppointmentFilters filters={filters} onFiltersChange={setFilters} />

        {/* Doctor List */}
        <DoctorList filters={filters} onBookAppointment={setSelectedDoctor} />

        {/* Booking Modal */}
        {selectedDoctor && (
          <BookingModal doctor={selectedDoctor} open={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} />
        )}
      </div>
    </div>
  )
}

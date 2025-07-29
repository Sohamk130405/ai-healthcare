"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Calendar } from "lucide-react"

const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 127,
    location: "Downtown Medical Center",
    distance: "2.3 miles",
    experience: "15 years",
    nextAvailable: "Tomorrow 2:00 PM",
    image: "/placeholder.svg?height=80&width=80",
    price: "$150",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "General Practitioner",
    rating: 4.8,
    reviews: 89,
    location: "City Health Clinic",
    distance: "1.8 miles",
    experience: "12 years",
    nextAvailable: "Today 4:30 PM",
    image: "/placeholder.svg?height=80&width=80",
    price: "$120",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 156,
    location: "Skin Care Specialists",
    distance: "3.1 miles",
    experience: "10 years",
    nextAvailable: "Friday 10:00 AM",
    image: "/placeholder.svg?height=80&width=80",
    price: "$180",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedist",
    rating: 4.9,
    reviews: 203,
    location: "Sports Medicine Center",
    distance: "4.2 miles",
    experience: "18 years",
    nextAvailable: "Monday 9:00 AM",
    image: "/placeholder.svg?height=80&width=80",
    price: "$200",
  },
]

interface DoctorListProps {
  filters: any
  onBookAppointment: (doctor: any) => void
}

export function DoctorList({ filters, onBookAppointment }: DoctorListProps) {
  const filteredDoctors = doctors.filter((doctor) => {
    if (filters.specialty && doctor.specialty !== filters.specialty) return false
    if (filters.rating && doctor.rating < filters.rating) return false
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Available Doctors ({filteredDoctors.length})</h2>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                  <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
                  <AvatarFallback className="text-base sm:text-lg">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{doctor.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {doctor.specialty}
                      </Badge>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-base sm:text-lg font-semibold">{doctor.price}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">per visit</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{doctor.rating}</span>
                      <span className="ml-1">({doctor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{doctor.experience} experience</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center justify-center sm:justify-start">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-center sm:text-left">{doctor.distance}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600" />
                  <span className="text-green-600 font-medium">Next available: {doctor.nextAvailable}</span>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                    View Profile
                  </Button>
                  <Button size="sm" onClick={() => onBookAppointment(doctor)} className="w-full sm:w-auto">
                    Book Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

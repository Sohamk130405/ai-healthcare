"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, X } from "lucide-react"

const specialties = [
  "General Practitioner",
  "Cardiologist",
  "Dermatologist",
  "Orthopedist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
]

const locations = ["Downtown Medical Center", "City Health Clinic", "Suburban Hospital", "University Medical Center"]

const availabilityOptions = ["Today", "Tomorrow", "This Week", "Next Week"]

interface AppointmentFiltersProps {
  filters: {
    specialty: string
    location: string
    availability: string
    rating: number
  }
  onFiltersChange: (filters: any) => void
}

export function AppointmentFilters({ filters, onFiltersChange }: AppointmentFiltersProps) {
  const updateFilter = (key: string, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      specialty: "",
      location: "",
      availability: "",
      rating: 0,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Doctors</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Specialty</label>
            <Select value={filters.specialty} onValueChange={(value) => updateFilter("specialty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Availability</label>
            <Select value={filters.availability} onValueChange={(value) => updateFilter("availability", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Rating</label>
            <Select
              value={filters.rating.toString()}
              onValueChange={(value) => updateFilter("rating", Number.parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="4.5">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    4.5+
                  </div>
                </SelectItem>
                <SelectItem value="4.0">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    4.0+
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {filters.specialty && (
              <Badge variant="secondary" className="px-3 py-1">
                {filters.specialty}
                <button onClick={() => updateFilter("specialty", "")} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="px-3 py-1">
                {filters.location}
                <button onClick={() => updateFilter("location", "")} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.availability && (
              <Badge variant="secondary" className="px-3 py-1">
                {filters.availability}
                <button onClick={() => updateFilter("availability", "")} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {filters.rating}+ Rating
                <button onClick={() => updateFilter("rating", 0)} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

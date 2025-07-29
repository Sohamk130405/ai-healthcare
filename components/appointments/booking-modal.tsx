"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, MapPin, Star, CheckCircle } from "lucide-react"

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

interface BookingModalProps {
  doctor: any
  open: boolean
  onClose: () => void
}

export function BookingModal({ doctor, open, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [isBooked, setIsBooked] = useState(false)

  const handleBooking = () => {
    // Booking logic would go here
    setIsBooked(true)
    setTimeout(() => {
      onClose()
      setIsBooked(false)
    }, 2000)
  }

  if (isBooked) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Appointment Booked!</h3>
            <p className="text-muted-foreground">
              Your appointment with {doctor.name} has been confirmed for {selectedDate?.toLocaleDateString()} at{" "}
              {selectedTime}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
                  <AvatarFallback>
                    {doctor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{doctor.name}</h3>
                  <Badge variant="secondary">{doctor.specialty}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>
                      {doctor.rating} ({doctor.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{doctor.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Reason for visit (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe your symptoms or reason for the appointment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="text-lg font-semibold">Consultation Fee: {doctor.price}</div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Booking Summary & Actions */}
        {selectedDate && selectedTime && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{doctor.location}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total:</span>
                  <span className="font-semibold text-lg">{doctor.price}</span>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleBooking} className="flex-1">
                  Confirm Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

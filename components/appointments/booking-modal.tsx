"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Star,
  CheckCircle,
  IndianRupee,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { TimeSlotPicker } from "./time-slot-picker";
import { format } from "date-fns";

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

interface BookingModalProps {
  doctor: Doctor;
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ doctor, open, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    // Convert time to 24-hour format for database
    const [time, period] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":");
    let hour24 = Number.parseInt(hours);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    const startTime = `${hour24.toString().padStart(2, "0")}:${minutes}:00`;
    const endHour = hour24 + 1; // Assuming 1-hour slots
    const endTime = `${endHour.toString().padStart(2, "0")}:${minutes}:00`;

    const appointmentData = {
      doctorEmail: doctor.email,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", // YYYY-MM-DD format
      startTime: startTime,
      endTime: endTime,
      reason: reason.trim(),
      notes: notes.trim() || null,
      status: "pending",
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setIsBooked(true);
        setTimeout(() => {
          onClose();
          setIsBooked(false);
          setSelectedDate(new Date());
          setSelectedTime("");
          setReason("");
          setNotes("");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to book appointment");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable dates before today (ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) return true;

    // Check if doctor is available on this day
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[date.getDay()] as keyof typeof doctor.workingHours;
    const daySchedule = doctor.workingHours[dayName];

    return !daySchedule?.available;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError(null); // Clear any previous errors when selecting a time
  };

  if (isBooked) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Appointment Booked!</h3>
            <p className="text-muted-foreground">
              Your appointment with Dr. {doctor.name} has been scheduled for{" "}
              {selectedDate && format(selectedDate, "yyyy-MM-dd")} at{" "}
              {selectedTime}.
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment with Dr. {doctor.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={doctor.image || "/placeholder.svg?height=64&width=64"}
                    alt={doctor.name}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg">
                    {doctor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
                  <Badge variant="secondary">{doctor.specialization}</Badge>
                  {doctor.rating && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>
                        {doctor.rating}{" "}
                        {doctor.reviewCount &&
                          `(${doctor.reviewCount} reviews)`}
                      </span>
                    </div>
                  )}
                  {doctor.city && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{doctor.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctor.qualifications && (
                  <div>
                    <Label className="text-sm font-medium">
                      Qualifications
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doctor.qualifications}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    ${doctor.consultationFee}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    consultation fee
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Time Slot Selection */}
        <div className="mt-6">
          <TimeSlotPicker
            selectedDate={selectedDate}
            doctorEmail={doctor.email}
            workingHours={doctor.workingHours}
            onTimeSelect={handleTimeSelect}
            selectedTime={selectedTime}
          />
        </div>

        {/* Appointment Details Form */}
        {selectedDate && selectedTime && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the reason for your appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information you'd like the doctor to know..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Summary & Actions */}
        {selectedDate && selectedTime && reason.trim() && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-medium">Dr. {doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {selectedDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialization:</span>
                  <span className="font-medium">{doctor.specialization}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total:</span>
                  <span className="font-semibold text-lg">
                    ${doctor.consultationFee}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBooking}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

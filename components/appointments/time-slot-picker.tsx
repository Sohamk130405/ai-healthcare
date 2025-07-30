"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
  startTime24: string;
  endTime24: string;
}

interface BookedAppointment {
  startTime: string;
  endTime: string;
}

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  doctorEmail: string;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  onTimeSelect: (time: string) => void;
  selectedTime: string;
}

export function TimeSlotPicker({
  selectedDate,
  doctorEmail,
  workingHours,
  onTimeSelect,
  selectedTime,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate && doctorEmail) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorEmail]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/appointments/available-slots?doctorEmail=${encodeURIComponent(
          doctorEmail
        )}&date=${selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}`
      );

      if (response.ok) {
        const data = await response.json();
        const bookedAppointments: BookedAppointment[] = data.appointments || [];
        generateSlotsWithBookings(bookedAppointments);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch available slots");
        generateSlotsWithBookings([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Network error. Please try again.");
      generateSlotsWithBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlotsWithBookings = (
    bookedAppointments: BookedAppointment[]
  ) => {
    if (!selectedDate) return;

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[selectedDate.getDay()];
    const daySchedule = workingHours[dayName];

    if (!daySchedule?.available) {
      setAvailableSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const startTime = new Date(`2000-01-01T${daySchedule.start}:00`);
    const endTime = new Date(`2000-01-01T${daySchedule.end}:00`);

    // Generate 30-minute slots
    while (startTime < endTime) {
      const timeString = startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const startTime24 = startTime.toTimeString().slice(0, 8); // HH:MM:SS format
      const endSlotTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
      const endTime24 = endSlotTime.toTimeString().slice(0, 8);

      // Check if slot conflicts with any booked appointment
      const isBooked = bookedAppointments.some((appointment) => {
        // Check if there's any overlap between the slot and the booked appointment
        return (
          (startTime24 >= appointment.startTime &&
            startTime24 < appointment.endTime) ||
          (endTime24 > appointment.startTime &&
            endTime24 <= appointment.endTime) ||
          (startTime24 <= appointment.startTime &&
            endTime24 >= appointment.endTime)
        );
      });

      // Check if slot is in the past (for today)
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      let isPast = false;

      if (isToday) {
        const now = new Date();
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(startTime.getHours(), startTime.getMinutes());
        isPast = slotDateTime <= now;
      }

      // Determine availability and reason
      let available = true;
      let reason: string | undefined;

      if (isPast) {
        available = false;
        reason = "Past time";
      } else if (isBooked) {
        available = false;
        reason = "Booked";
      }

      slots.push({
        time: timeString,
        available,
        reason,
        startTime24,
        endTime24,
      });

      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    setAvailableSlots(slots);
  };

  if (!selectedDate) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Please select a date first
          </p>
        </CardContent>
      </Card>
    );
  }

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[selectedDate.getDay()];
  const daySchedule = workingHours[dayName];

  if (!daySchedule?.available) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
          <p className="text-sm text-yellow-800">
            Doctor is not available on {selectedDate.toLocaleDateString()}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Please select a different date
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
          <p className="text-sm text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAvailableSlots}
            className="mt-2 bg-transparent"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Times - {selectedDate.toLocaleDateString()}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Working hours: {daySchedule.start} - {daySchedule.end}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading available slots...
            </p>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={
                    selectedTime === slot.time
                      ? "default"
                      : slot.available
                      ? "outline"
                      : "secondary"
                  }
                  size="sm"
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`text-xs h-10 relative ${
                    !slot.available
                      ? "opacity-60 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200"
                      : slot.available && selectedTime !== slot.time
                      ? "hover:bg-blue-50 hover:border-blue-300"
                      : ""
                  }`}
                  title={slot.reason || "Available"}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {slot.time}
                  {!slot.available && slot.reason && (
                    <Badge
                      variant="secondary"
                      className={`ml-1 text-xs ${
                        slot.reason === "Booked"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {slot.reason === "Booked" ? "Booked" : "N/A"}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                <span>Booked/Unavailable</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No time slots available for this date
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Doctor may not be working or all slots are booked
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

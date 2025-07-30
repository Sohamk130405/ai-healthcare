"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

interface Appointment {
  id: number;
  patientEmail: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  reason: string;
  notes?: string;
  createdAt: string;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();

  useEffect(() => {
    user && fetchDoctorAppointments();
  }, [user]);

  const fetchDoctorAppointments = async () => {
    try {
      // In real implementation, get doctor email from session
      const doctorEmail = user?.primaryEmailAddress?.emailAddress;
      const response = await fetch(
        `/api/appointments/doctor?doctorEmail=${doctorEmail}`
      );
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: number,
    status: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: status as any, notes: notes || apt.notes }
              : apt
          )
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter((apt) => apt.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Appointments
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your patient appointments and schedule.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">
                    {getAppointmentsByStatus("pending").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Confirmed
                  </p>
                  <p className="text-2xl font-bold">
                    {getAppointmentsByStatus("confirmed").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {getAppointmentsByStatus("completed").length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Cancelled</p>
                  <p className="text-2xl font-bold">
                    {getAppointmentsByStatus("cancelled").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>
                  Manage and review your patient appointments
                </CardDescription>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4 mt-6">
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={`/placeholder.svg?height=48&width=48&text=${appointment.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}`}
                              />
                              <AvatarFallback>
                                {appointment.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {appointment.patientName}
                                </h3>
                                <Badge
                                  className={getStatusColor(appointment.status)}
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {formatTime(appointment.startTime)} -{" "}
                                  {formatTime(appointment.endTime)}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  {appointment.patientEmail}
                                </div>
                                <div className="flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  {appointment.reason}
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm text-gray-700">
                                    <strong>Notes:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "confirmed"
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "cancelled",
                                      "Cancelled by doctor"
                                    )
                                  }
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "completed",
                                    "Appointment completed successfully"
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No appointments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter === "all"
                        ? "You don't have any appointments yet."
                        : `No ${filter} appointments found.`}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Calendar View
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Calendar integration coming soon.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

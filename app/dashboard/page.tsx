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
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  CalendarDays,
  MessageSquare,
  Upload,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  reason: string;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/my-appointments");
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments.slice(0, 3)); // Show only recent 3
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
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
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your health overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {
                      appointments.filter((apt) => apt.status === "confirmed")
                        .length
                    }
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      appointments.filter((apt) => apt.status === "completed")
                        .length
                    }
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Health Score
                  </p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
                <Heart className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Reports</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Appointments Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">My Appointments</CardTitle>
                  <CardDescription>
                    Your upcoming and recent appointments
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/my-appointments">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/placeholder.svg?height=48&width=48&text=${appointment.doctorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback>
                            {appointment.doctorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Dr. {appointment.doctorName}
                            </p>
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {appointment.doctorSpecialization}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(appointment.date)}
                            <Clock className="ml-3 mr-1 h-3 w-3" />
                            {formatTime(appointment.startTime)} -{" "}
                            {formatTime(appointment.endTime)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No appointments
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by booking your first appointment.
                    </p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/appointments">Book Appointment</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Link href="/symptom-checker">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Symptom Checker
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Link href="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    AI Health Chat
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Health Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Blood Pressure</p>
                    <p className="text-xs text-gray-500">Normal - 120/80</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Heart Rate</p>
                    <p className="text-xs text-gray-500">72 BPM</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Next Checkup</p>
                    <p className="text-xs text-gray-500">Due in 2 weeks</p>
                  </div>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

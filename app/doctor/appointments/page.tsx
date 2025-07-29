"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Video,
  MessageSquare,
} from "lucide-react"

const appointments = [
  {
    id: "1",
    patient: {
      name: "Sarah Johnson",
      age: 34,
      phone: "+1 (555) 123-4567",
      email: "sarah.j@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2024-01-15",
    time: "09:00 AM",
    type: "In-Person",
    status: "confirmed",
    reason: "Regular checkup and blood pressure monitoring",
    duration: "30 min",
    notes: "Patient has been experiencing mild headaches",
  },
  {
    id: "2",
    patient: {
      name: "Michael Chen",
      age: 28,
      phone: "+1 (555) 987-6543",
      email: "m.chen@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2024-01-15",
    time: "10:30 AM",
    type: "Video Call",
    status: "pending",
    reason: "Follow-up consultation for medication review",
    duration: "20 min",
    notes: "Needs prescription renewal",
  },
  {
    id: "3",
    patient: {
      name: "Emily Rodriguez",
      age: 45,
      phone: "+1 (555) 456-7890",
      email: "emily.r@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2024-01-15",
    time: "02:00 PM",
    type: "In-Person",
    status: "completed",
    reason: "Skin examination and mole check",
    duration: "45 min",
    notes: "Annual skin screening completed",
  },
  {
    id: "4",
    patient: {
      name: "David Wilson",
      age: 52,
      phone: "+1 (555) 321-0987",
      email: "d.wilson@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2024-01-16",
    time: "11:00 AM",
    type: "In-Person",
    status: "confirmed",
    reason: "Diabetes management and blood sugar review",
    duration: "30 min",
    notes: "Bring recent lab results",
  },
]

export default function DoctorAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    const matchesType = typeFilter === "all" || appointment.type.toLowerCase().replace(" ", "-") === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const todayAppointments = filteredAppointments.filter((apt) => apt.date === "2024-01-15")
  const upcomingAppointments = filteredAppointments.filter((apt) => apt.date > "2024-01-15")
  const completedAppointments = filteredAppointments.filter((apt) => apt.status === "completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Appointment Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              My Appointments
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Manage your patient appointments, consultations, and schedule
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Today's Appointments</p>
                    <p className="text-2xl sm:text-3xl font-bold">{todayAppointments.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Upcoming</p>
                    <p className="text-2xl sm:text-3xl font-bold">{upcomingAppointments.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Completed</p>
                    <p className="text-2xl sm:text-3xl font-bold">{completedAppointments.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total Patients</p>
                    <p className="text-2xl sm:text-3xl font-bold">156</p>
                  </div>
                  <User className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients or appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="video-call">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Tabs */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="today" className="w-full">
              <div className="p-4 sm:p-6 pb-0">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 p-1 rounded-xl">
                  <TabsTrigger
                    value="today"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Today ({todayAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Upcoming ({upcomingAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Completed ({completedAppointments.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 sm:p-6 pt-6">
                <TabsContent value="today" className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border border-gray-200 hover:shadow-lg transition-all duration-300 card-hover"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-200">
                              <AvatarImage
                                src={appointment.patient.avatar || "/placeholder.svg"}
                                alt={appointment.patient.name}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg text-gray-800">{appointment.patient.name}</h3>
                              <p className="text-sm text-gray-600">Age: {appointment.patient.age}</p>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                {appointment.time} ({appointment.duration})
                              </div>
                              <div className="flex items-center text-gray-600">
                                {appointment.type === "Video Call" ? (
                                  <Video className="h-4 w-4 mr-2" />
                                ) : (
                                  <MapPin className="h-4 w-4 mr-2" />
                                )}
                                {appointment.type}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                {appointment.patient.phone}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {appointment.patient.email}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-800">Reason:</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                            {appointment.notes && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-800">Notes:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{appointment.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                            {appointment.status === "confirmed" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                                >
                                  {appointment.type === "Video Call" ? (
                                    <>
                                      <Video className="h-4 w-4 mr-2" />
                                      Start Call
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Check In
                                    </>
                                  )}
                                </Button>
                                <Button size="sm" variant="outline" className="bg-transparent">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </>
                            )}
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" className="bg-transparent">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border border-gray-200 hover:shadow-lg transition-all duration-300 card-hover"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-200">
                              <AvatarImage
                                src={appointment.patient.avatar || "/placeholder.svg"}
                                alt={appointment.patient.name}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg text-gray-800">{appointment.patient.name}</h3>
                              <p className="text-sm text-gray-600">Age: {appointment.patient.age}</p>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                {appointment.time} ({appointment.duration})
                              </div>
                              <div className="flex items-center text-gray-600">
                                {appointment.type === "Video Call" ? (
                                  <Video className="h-4 w-4 mr-2" />
                                ) : (
                                  <MapPin className="h-4 w-4 mr-2" />
                                )}
                                {appointment.type}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-800">Reason:</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message Patient
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {completedAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border border-gray-200 hover:shadow-lg transition-all duration-300 card-hover"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-200">
                              <AvatarImage
                                src={appointment.patient.avatar || "/placeholder.svg"}
                                alt={appointment.patient.name}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg text-gray-800">{appointment.patient.name}</h3>
                              <p className="text-sm text-gray-600">Age: {appointment.patient.age}</p>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <Badge className={getStatusColor(appointment.status)}>Completed</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                {appointment.time} ({appointment.duration})
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-800">Reason:</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-800">Notes:</p>
                              <p className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg">{appointment.notes}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              View Report
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              Follow Up
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, FileText, MessageSquare, Heart, TrendingUp, Clock, MapPin, Sparkles, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 mx-auto">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Health Dashboard
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Health Dashboard
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your health information, appointments, and get personalized insights.
            </p>
          </div>

          {/* Health Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-blue-100">Next Appointment</CardTitle>
                <Calendar className="h-5 w-5 text-blue-200" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">Tomorrow</div>
                <p className="text-xs text-blue-100">Dr. Sarah Johnson at 2:00 PM</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-green-100">Health Score</CardTitle>
                <Heart className="h-5 w-5 text-green-200" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">85/100</div>
                <p className="text-xs text-green-100">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-purple-100">Reports Uploaded</CardTitle>
                <FileText className="h-5 w-5 text-purple-200" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-purple-100">3 this month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-pink-500 to-rose-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-pink-100">AI Consultations</CardTitle>
                <MessageSquare className="h-5 w-5 text-pink-200" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">24</div>
                <p className="text-xs text-pink-100">5 this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Prediction */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Health Risk Assessment
                </span>
              </CardTitle>
              <CardDescription className="text-lg">AI-powered analysis based on your health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Cardiovascular Risk</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">Low</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-yellow-800">Diabetes Risk</span>
                  </div>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Moderate</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-800">Overall Health</span>
                  </div>
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="appointments" className="space-y-6">
              <div className="p-6 pb-0">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 p-1 rounded-xl">
                  <TabsTrigger
                    value="appointments"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Medical Files
                  </TabsTrigger>
                  <TabsTrigger
                    value="chats"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Chat History
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    Health Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 pt-0">
                <TabsContent value="appointments">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h3>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book New
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          doctor: "Dr. Sarah Johnson",
                          specialty: "Cardiologist",
                          date: "Tomorrow",
                          time: "2:00 PM",
                          location: "Downtown Medical Center",
                          status: "confirmed",
                          gradient: "from-blue-500 to-purple-600",
                        },
                        {
                          doctor: "Dr. Michael Chen",
                          specialty: "General Practitioner",
                          date: "Friday",
                          time: "10:00 AM",
                          location: "City Health Clinic",
                          status: "pending",
                          gradient: "from-green-500 to-teal-600",
                        },
                      ].map((appointment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200/50 card-hover"
                        >
                          <div className={`p-3 bg-gradient-to-r ${appointment.gradient} rounded-xl`}>
                            <Avatar className="h-10 w-10 border-2 border-white">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" />
                              <AvatarFallback className="bg-white text-gray-700">
                                {appointment.doctor
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="font-semibold text-gray-800 text-lg">{appointment.doctor}</p>
                            <p className="text-gray-600">{appointment.specialty}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.date} at {appointment.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {appointment.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant={appointment.status === "confirmed" ? "default" : "secondary"}
                              className={appointment.status === "confirmed" ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {appointment.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="hover:bg-blue-50 bg-transparent">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="files">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">Medical Files</h3>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Upload New
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Blood Test Results - Jan 2024",
                          type: "Lab Report",
                          date: "2 days ago",
                          status: "Analyzed",
                          gradient: "from-red-400 to-pink-500",
                        },
                        {
                          name: "X-Ray Chest - Dec 2023",
                          type: "Imaging",
                          date: "1 week ago",
                          status: "Analyzed",
                          gradient: "from-blue-400 to-cyan-500",
                        },
                        {
                          name: "Prescription - Dr. Johnson",
                          type: "Prescription",
                          date: "2 weeks ago",
                          status: "Active",
                          gradient: "from-green-400 to-emerald-500",
                        },
                      ].map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-2xl border border-gray-200/50 card-hover"
                        >
                          <div
                            className={`w-14 h-14 bg-gradient-to-r ${file.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <FileText className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-gray-800 text-lg">{file.name}</p>
                            <p className="text-gray-600">{file.type}</p>
                            <p className="text-sm text-gray-500">{file.date}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                              {file.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="hover:bg-purple-50 bg-transparent">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chats">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">Chat History</h3>
                      <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Headache and fever symptoms",
                          date: "2 hours ago",
                          messages: 12,
                          gradient: "from-orange-400 to-red-500",
                        },
                        {
                          title: "Blood pressure concerns",
                          date: "1 day ago",
                          messages: 8,
                          gradient: "from-blue-400 to-indigo-500",
                        },
                        {
                          title: "Medication side effects",
                          date: "3 days ago",
                          messages: 15,
                          gradient: "from-purple-400 to-pink-500",
                        },
                      ].map((chat, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-green-50/50 rounded-2xl border border-gray-200/50 card-hover"
                        >
                          <div
                            className={`w-14 h-14 bg-gradient-to-r ${chat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <MessageSquare className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-gray-800 text-lg">{chat.title}</p>
                            <p className="text-sm text-gray-500">
                              {chat.messages} messages • {chat.date}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="hover:bg-green-50 bg-transparent">
                            Continue Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights">
                  <div className="space-y-6">
                    <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Health Insights Coming Soon</h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        We're analyzing your health data to provide personalized insights and recommendations.
                      </p>
                      <Button className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Notified
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}

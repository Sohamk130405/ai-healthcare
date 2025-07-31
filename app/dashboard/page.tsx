"use client";
import ReactJson from "react-json-view";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Stethoscope,
  CalendarDays,
  MessageSquare,
  Upload,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Download,
  Share2,
  Loader2,
  Star,
  CheckCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/ui/start-rating";

const JsonTable = ({ data }: any) => {
  if (typeof data !== "object" || data === null) {
    return <span>{String(data)}</span>;
  }

  return (
    <table className="w-full text-sm text-left border border-gray-300 rounded mb-2">
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key} className="border-t border-gray-200">
            <td className="font-medium px-3 py-2 w-1/4 bg-gray-100">{key}</td>
            <td className="px-3 py-2">
              {typeof value === "object" && value !== null ? (
                <details className="bg-white">
                  <summary className="cursor-pointer text-blue-600 underline">
                    Expand
                  </summary>
                  <div className="mt-2">
                    <JsonTable data={value} />
                  </div>
                </details>
              ) : (
                String(value)
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface Appointment {
  id: number;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialization: string;
  date: string;
  startTime: string;
  endTime: string;
  rating: number;
  reviewCount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  reason: string;
  hasRated?: boolean; // Track if user has already rated this appointment
  phoneNumber: number;
}

interface MedicalRecord {
  id: number;
  reportName: string;
  reportUrl: string;
  reportType: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  extractedText: string;
  structuredData: string;
  insights: string[];
  userEmail: string;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
  }>({ open: false, appointment: null });
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchMyAppointments();
    user && fetchMedicalRecords();
  }, [user]);

  const fetchMyAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/my-appointments");
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments.slice(0, 5)); // Show recent 5 for dashboard
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      setRecordsLoading(true);
      const response = await fetch(
        `/api/medical-records?userEmail=${user?.primaryEmailAddress
          ?.emailAddress!}`
      );
      const data = await response.json();
      if (data.success) {
        setMedicalRecords(data.records);
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleRateDoctor = async () => {
    if (!ratingModal.appointment || userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setRatingLoading(true);
    try {
      const response = await fetch("/api/doctors/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorEmail: ratingModal.appointment.doctorEmail,
          rating: userRating,
          appointmentId: ratingModal.appointment.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Rating Submitted!",
          description: `Thank you for rating Dr. ${ratingModal.appointment.doctorName}.`,
        });

        // Update the appointment to mark as rated
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === ratingModal.appointment!.id
              ? { ...apt, hasRated: true }
              : apt
          )
        );

        setRatingModal({ open: false, appointment: null });
        setUserRating(0);
      } else {
        const errorData = await response.json();
        toast({
          title: "Rating Failed",
          description: errorData.error || "Could not submit your rating.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not submit rating due to network issues.",
        variant: "destructive",
      });
    } finally {
      setRatingLoading(false);
    }
  };

  const openRatingModal = (appointment: Appointment) => {
    console.log(appointment);
    setRatingModal({ open: true, appointment });
    setUserRating(0);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "lab_report":
        return "🧪";
      case "prescription":
        return "💊";
      case "medical":
        return "🏥";
      case "educational":
        return "📚";
      case "x-ray":
        return "🩻";
      case "mri":
        return "🧠";
      case "blood_test":
        return "🩸";
      default:
        return "📄";
    }
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.extractedText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || record.reportType === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(medicalRecords.map((record) => record.reportType))
  );

  // Get appointments that can be rated (confirmed status and not already rated)
  const ratableAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" && !apt.hasRated
  );

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
                    Pending Ratings
                  </p>
                  <p className="text-2xl font-bold">
                    {ratableAppointments.length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Medical Records
                  </p>
                  <p className="text-2xl font-bold">{medicalRecords.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <Tabs defaultValue="appointments" className="space-y-6">
                <div className="p-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl">
                    <TabsTrigger
                      value="appointments"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                    >
                      My Appointments
                    </TabsTrigger>
                    <TabsTrigger
                      value="records"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                    >
                      Medical Records
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6 pt-0">
                  {/* Appointments Tab */}
                  <TabsContent value="appointments">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Recent Appointments
                          </h3>
                          <p className="text-sm text-gray-600">
                            Your upcoming and recent appointments
                          </p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href="/my-appointments">View All</Link>
                        </Button>
                      </div>

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
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={getStatusColor(
                                        appointment.status
                                      )}
                                    >
                                      {appointment.status}
                                    </Badge>
                                    {appointment.status === "completed" &&
                                      !appointment.hasRated && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            openRatingModal(appointment)
                                          }
                                          className="text-xs px-2 py-1 h-6"
                                        >
                                          <Star className="h-3 w-3 mr-1" />
                                          Rate
                                        </Button>
                                      )}
                                    {appointment.hasRated && (
                                      <div className="flex items-center text-xs text-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Rated
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {appointment.doctorSpecialization}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500 flex-wrap">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {formatDate(appointment.date)}
                                  <Clock className="ml-3 mr-1 h-3 w-3" />
                                  {formatTime(appointment.startTime)} -{" "}
                                  {formatTime(appointment.endTime)}
                                  {appointment.rating && (
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                                      <span className="font-medium">
                                        {appointment.rating}
                                      </span>
                                      {appointment.reviewCount && (
                                        <span className="ml-1">
                                          ({appointment.reviewCount} reviews)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <Link
                                    href={`tel:${appointment.phoneNumber}`}
                                    className="ml-auto"
                                  >
                                    <Button
                                      variant="outline"
                                      size={"icon"}
                                      className="bg-transparent border border-green-500 rounded-full"
                                    >
                                      <Phone className="text-green-500" />
                                    </Button>
                                  </Link>
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
                    </div>
                  </TabsContent>

                  {/* Medical Records Tab */}
                  <TabsContent value="records">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Medical Records
                          </h3>
                          <p className="text-sm text-gray-600">
                            View and manage your uploaded medical documents
                          </p>
                        </div>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        >
                          <Link href="/upload">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New
                          </Link>
                        </Button>
                      </div>

                      {/* Search and Filter */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={filterCategory}
                          onValueChange={setFilterCategory}
                        >
                          <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.replace("_", " ").toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {recordsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-muted-foreground mt-2">
                            Loading medical records...
                          </p>
                        </div>
                      ) : filteredRecords.length > 0 ? (
                        <div className="space-y-4">
                          {filteredRecords.slice(0, 3).map((record) => (
                            <Card
                              key={record.id}
                              className="hover:shadow-lg transition-shadow border-0 shadow-md"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="text-2xl">
                                      {getCategoryIcon(record.reportType)}
                                    </div>
                                    <div className="flex-1 min-w-0 w-[100px] sm:w-full">
                                      <h4 className="text-lg font-medium truncate">
                                        {record.reportName}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {record.reportType
                                            .replace("_", " ")
                                            .toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          •
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {formatFileSize(record.fileSize)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          •
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            record.uploadedAt
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {record.extractedText && (
                                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2">
                                      Extracted Text Preview:
                                    </p>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {record.extractedText.substring(0, 150)}
                                      ...
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedRecord(record)}
                                    className="flex-1"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(record.reportUrl, "_blank")
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {filteredRecords.length > 3 && (
                            <div className="text-center pt-4">
                              <Button variant="outline" asChild>
                                <Link href="/upload">View All Records</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No medical records found
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            {searchTerm || filterCategory !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Upload your first medical document to get started"}
                          </p>
                          <Button asChild>
                            <Link href="/upload">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Medical Document
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
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

        {/* Rating Modal */}
        <Dialog
          open={ratingModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setRatingModal({ open: false, appointment: null });
              setUserRating(0);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rate Your Experience</DialogTitle>
            </DialogHeader>

            {ratingModal.appointment && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage
                      src={`/placeholder.svg?height=64&width=64&text=${ratingModal.appointment.doctorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}`}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {ratingModal.appointment.doctorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">
                    Dr. {ratingModal.appointment.doctorName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {ratingModal.appointment.doctorSpecialization}
                  </p>
                  <p className="text-xs text-gray-500">
                    Appointment on {formatDate(ratingModal.appointment.date)}
                  </p>
                  <Link
                    href={`tel:${ratingModal.appointment.phoneNumber}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="bg-transparent">
                      <Phone className="mr-2" /> Call{" "}
                      {ratingModal.appointment.phoneNumber}
                    </Button>
                  </Link>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-700">
                    How would you rate your experience with this doctor?
                  </p>
                  <div className="flex justify-center">
                    <StarRating
                      initialRating={userRating}
                      onRatingChange={setUserRating}
                      size="lg"
                    />
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-600">
                      {userRating === 1 && "Poor"}
                      {userRating === 2 && "Fair"}
                      {userRating === 3 && "Good"}
                      {userRating === 4 && "Very Good"}
                      {userRating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRatingModal({ open: false, appointment: null });
                  setUserRating(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRateDoctor}
                disabled={ratingLoading || userRating === 0}
              >
                {ratingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Medical Record Detail Modal */}
        {selectedRecord && (
          <Dialog
            open={!!selectedRecord}
            onOpenChange={(open) => !open && setSelectedRecord(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 line-clamp-1">
                  <span className="text-2xl">
                    {getCategoryIcon(selectedRecord.reportType)}
                  </span>
                  {selectedRecord.reportName}
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  {selectedRecord.reportType.replace("_", " ").toUpperCase()} •{" "}
                  {formatFileSize(selectedRecord.fileSize)} •
                  {new Date(selectedRecord.uploadedAt).toLocaleDateString()}
                </p>
              </DialogHeader>

              <div className="overflow-y-auto max-h-[70vh]">
                <Tabs defaultValue="text" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="text">Extracted Text</TabsTrigger>
                    <TabsTrigger value="document">Document Preview</TabsTrigger>
                    {selectedRecord.structuredData && (
                      <TabsTrigger value="structured">
                        Structured Data
                      </TabsTrigger>
                    )}
                    {selectedRecord.insights &&
                      selectedRecord.insights.length > 0 && (
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                      )}
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {selectedRecord.extractedText}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="document">
                    <div className="flex justify-center">
                      {selectedRecord.fileType?.includes("pdf") ? (
                        <div className="text-center p-8">
                          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">PDF Document</p>
                          <Button
                            onClick={() =>
                              window.open(selectedRecord.reportUrl, "_blank")
                            }
                          >
                            Open PDF
                          </Button>
                        </div>
                      ) : (
                        <img
                          src={selectedRecord.reportUrl || "/placeholder.svg"}
                          alt="Document preview"
                          className="max-w-full h-auto max-h-96 object-contain rounded-lg border"
                        />
                      )}
                    </div>
                  </TabsContent>

                  {selectedRecord.structuredData && (
                    <TabsContent value="structured">
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        {(() => {
                          try {
                            const outer = JSON.parse(
                              selectedRecord.structuredData.replace(/\n/g, "")
                            );
                            const inner =
                              typeof outer === "string"
                                ? JSON.parse(outer)
                                : outer;

                            return <JsonTable data={inner} />;
                          } catch (e) {
                            return (
                              <p className="text-red-500">
                                Invalid JSON format
                              </p>
                            );
                          }
                        })()}
                      </div>
                    </TabsContent>
                  )}

                  {selectedRecord.insights &&
                    selectedRecord.insights.length > 0 && (
                      <TabsContent value="insights">
                        <div className="space-y-3">
                          {selectedRecord.insights.map((insight, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <p className="text-sm">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

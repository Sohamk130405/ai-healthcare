"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Camera, Save, Shield, Bell, CreditCard, Sparkles, Phone, Mail, Heart, Activity } from "lucide-react"

export default function ProfilePage() {
  
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    gender: "male",
    address: "123 Health Street, Medical City, MC 12345",
    emergencyContact: "Jane Doe",
    emergencyPhone: "+1 (555) 987-6543",
    bloodType: "O+",
    allergies: "Penicillin, Shellfish",
    medicalHistory: "Hypertension (controlled), Previous appendectomy (2018)",
  })

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
      <div className="container py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Profile
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Manage your personal information and account preferences
            </p>
          </div>

          {/* Profile Header Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Heart className="h-3 w-3 mr-1" />
                      Patient
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {profileData.email}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      {profileData.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className={
                      isEditing
                        ? "bg-transparent"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    }
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="personal" className="w-full">
              <div className="p-6 pb-0">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100/80 p-1 rounded-xl">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm"
                  >
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="medical"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm"
                  >
                    Medical Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm"
                  >
                    Preferences
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 pt-6">
                <TabsContent value="personal" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={profileData.gender}
                          onValueChange={(value) => handleInputChange("gender", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Medical Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          value={profileData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={profileData.emergencyPhone}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select
                          value={profileData.bloodType}
                          onValueChange={(value) => handleInputChange("bloodType", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="allergies">Known Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={profileData.allergies}
                          onChange={(e) => handleInputChange("allergies", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="medicalHistory">Medical History</Label>
                        <Textarea
                          id="medicalHistory"
                          value={profileData.medicalHistory}
                          onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
                    <div className="space-y-6">
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-600">Add an extra layer of security</p>
                            </div>
                          </div>
                          <Button variant="outline" className="bg-transparent">
                            Enable
                          </Button>
                        </div>
                      </Card>

                      <div className="space-y-4">
                        <h4 className="font-medium">Change Password</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" placeholder="Enter current password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" placeholder="Enter new password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input id="confirmNewPassword" type="password" placeholder="Confirm new password" />
                          </div>
                          <Button className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-600">Receive updates via email</p>
                            </div>
                          </div>
                          <Button variant="outline" className="bg-transparent">
                            Configure
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Payment Methods</p>
                              <p className="text-sm text-gray-600">Manage your payment options</p>
                            </div>
                          </div>
                          <Button variant="outline" className="bg-transparent">
                            Manage
                          </Button>
                        </div>
                      </Card>
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

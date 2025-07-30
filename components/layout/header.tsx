"use client";

import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
  Bot,
  Stethoscope,
  MessageSquare,
  Calendar,
  Upload,
  Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton, useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useUser();
  const { userDetail } = useContext(UserDetailContext);

  // Determine user role
  const userRole = userDetail?.role || "patient"; // Default to patient if no role found

  // Navigation for doctors
  const doctorNavigation = [
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
  ];

  // Navigation for patients
  const patientNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Book Appointment", href: "/appointments", icon: Calendar },
  ];

  // AI Features (moved to dropdown to save space)
  const aiFeatures = [
    { name: "Symptom Checker", href: "/symptom-checker", icon: Stethoscope },
    { name: "Chat with AI", href: "/chat", icon: MessageSquare },
  ];

  // Additional patient features
  const patientFeatures = [
    { name: "Upload Reports", href: "/upload", icon: Upload },
  ];

  // Get current navigation based on role
  const currentNavigation =
    userRole === "doctor" ? doctorNavigation : patientNavigation;

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-transform duration-300 p-2 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white font-bold text-sm h-5 w-5" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HealthPortal
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Main Navigation Links */}
          {currentNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group flex items-center space-x-1"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {/* AI Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
              >
                <Bot className="h-4 w-4 mr-1" />
                AI Features
                <ChevronDown className="h-3 w-3 ml-1" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {aiFeatures.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Patient-only features */}
          {userRole === "patient" &&
            patientFeatures.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group flex items-center space-x-1"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserButton />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {userDetail?.name || user.fullName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userDetail?.email ||
                        user.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-blue-600 font-medium capitalize">
                      {userRole}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      userRole === "doctor" ? "/doctor/dashboard" : "/dashboard"
                    }
                    className="flex items-center"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="hover:bg-blue-50 hover:text-blue-600"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                asChild
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-6">
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserButton />
                  <div>
                    <p className="font-medium text-sm">
                      {userDetail?.name || user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userRole}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 px-2">
                  Navigation
                </h3>
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* AI Features */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 px-2">
                  AI Features
                </h3>
                {aiFeatures.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Patient-only features */}
              {userRole === "patient" && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 px-2">
                    Tools
                  </h3>
                  {patientFeatures.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Auth Section */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    asChild
                  >
                    <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}

              {/* Settings for logged in users */}
              {user && (
                <div className="space-y-2 pt-4 border-t">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button className="flex items-center space-x-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors p-2 rounded-md hover:bg-red-50 w-full text-left">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

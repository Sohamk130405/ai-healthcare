import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Stethoscope, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute top-20 sm:top-40 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-10 sm:bottom-20 left-1/4 sm:left-1/3 w-56 sm:w-80 h-56 sm:h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm">
            <div className="relative">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
              AI-Powered Healthcare Assistant
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold tracking-tight leading-tight">
            Your AI-powered{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-float">
              Healthcare
            </span>{" "}
            Assistant
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Get instant health insights, check symptoms, consult with AI doctors, and manage your healthcare journey all
            in one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              asChild
            >
              <Link href="/symptom-checker">
                Check Symptoms
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-transparent"
              asChild
            >
              <Link href="/chat">Talk to AI Doctor</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

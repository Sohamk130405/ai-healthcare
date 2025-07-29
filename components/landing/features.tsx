import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, MessageSquare, Calendar, Upload, Brain, Shield, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Stethoscope,
    title: "Symptom Checker",
    description: "AI-powered symptom analysis with probable conditions and specialist recommendations.",
    gradient: "gradient-bg-1",
    iconColor: "text-white",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "24/7 intelligent health assistant for instant medical guidance and support.",
    gradient: "gradient-bg-2",
    iconColor: "text-white",
  },
  {
    icon: Calendar,
    title: "Book Appointments",
    description: "Easy appointment scheduling with qualified doctors and specialists.",
    gradient: "gradient-bg-3",
    iconColor: "text-white",
  },
  {
    icon: Upload,
    title: "Upload Reports",
    description: "Secure report upload with OCR analysis and intelligent insights.",
    gradient: "gradient-bg-4",
    iconColor: "text-white",
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "Advanced AI analysis for personalized health recommendations.",
    gradient: "gradient-bg-5",
    iconColor: "text-white",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "HIPAA-compliant platform ensuring your health data stays protected.",
    gradient: "gradient-bg-6",
    iconColor: "text-gray-700",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock access to health services and AI assistance.",
    gradient: "gradient-bg-1",
    iconColor: "text-white",
  },
  {
    icon: Users,
    title: "Expert Network",
    description: "Connect with verified healthcare professionals and specialists.",
    gradient: "gradient-bg-3",
    iconColor: "text-white",
  },
]

export function Features() {
  return (
    <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 sm:mb-16">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Comprehensive Healthcare Solutions
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Everything you need to manage your health in one intelligent platform
          </p>
        </div>

        <div className="responsive-grid">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div
                  className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

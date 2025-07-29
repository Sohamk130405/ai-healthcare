import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-yellow-400/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-white/60 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full px-4 py-2">
            <Sparkles className="h-4 w-4 text-yellow-600 animate-pulse" />
            <span className="text-sm font-medium text-yellow-700">Transform Your Healthcare</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Healthcare Experience?
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who trust our AI-powered platform for their healthcare needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-8 py-6 text-lg bg-transparent"
              asChild
            >
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

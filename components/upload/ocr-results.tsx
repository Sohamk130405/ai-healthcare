import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Brain, Lightbulb, Download, Share } from "lucide-react"

interface OCRResultsProps {
  results: {
    extractedText: string
    insights: string[]
    recommendations: string[]
  }
}

export function OCRResults({ results }: OCRResultsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analysis Complete</h2>
        <p className="text-muted-foreground">AI has processed your medical report and extracted key information</p>
      </div>

      {/* Extracted Text */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Extracted Text
            </CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono">{results.extractedText}</pre>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-0.5">
                  {index + 1}
                </Badge>
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">
                  {index + 1}
                </Badge>
                <p className="text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-green-800">What's Next?</h3>
            <p className="text-sm text-green-700">
              Based on your report analysis, consider these next steps for your healthcare journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="sm" variant="outline">
                Book Follow-up Appointment
              </Button>
              <Button size="sm" variant="outline">
                Consult AI Doctor
              </Button>
              <Button size="sm" variant="outline">
                Save to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

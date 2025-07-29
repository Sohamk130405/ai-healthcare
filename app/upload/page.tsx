"use client";

import { useState } from "react";
import { FileUploader } from "@/components/upload/file-uploader";
import { UploadedFiles } from "@/components/upload/uploaded-files";
import { OCRResults } from "@/components/upload/ocr-results";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Upload, FileText } from "lucide-react";
import { toast } from "sonner"; // Add this import

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [ocrResults, setOCRResults] = useState<any>(null);

  const handleFilesUploaded = async (files: File[]) => {
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: "processing",
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Upload each file to the backend
    for (const newFile of newFiles) {
      const formData = new FormData();
      formData.append("file", newFile.file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error((await res.json()).error || "Upload failed");
        }

        const data = await res.json();

        // Mark file as completed
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? { ...f, status: "completed", url: data.url }
              : f
          )
        );

        toast.success(`Uploaded ${newFile.name} successfully!`);

        // Simulate OCR results after upload
        setOCRResults({
          extractedText:
            "Patient: John Doe\nDate: 2024-01-15\nTest: Complete Blood Count\nResults:\n- Hemoglobin: 14.2 g/dL (Normal)\n- White Blood Cells: 7,200/μL (Normal)\n- Platelets: 250,000/μL (Normal)\n\nConclusion: All values within normal range.",
          insights: [
            "All blood parameters are within normal limits",
            "No signs of anemia or infection",
            "Platelet count is healthy",
          ],
          recommendations: [
            "Continue regular health monitoring",
            "Maintain current lifestyle",
            "Schedule next checkup in 6 months",
          ],
        });
      } catch (err: any) {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: "error" } : f))
        );
        toast.error(`Failed to upload ${newFile.name}: ${err.message}`);
      }
    }
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Medical Report Analysis</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            Upload Medical Reports
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your medical reports, lab results, or prescriptions for
            AI-powered analysis and insights.
          </p>
        </div>

        {/* Privacy Notice */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800">
                  Privacy & Security
                </p>
                <p className="text-sm text-blue-700">
                  Your medical documents are encrypted and processed securely.
                  We comply with HIPAA regulations and never share your personal
                  health information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Uploader */}
        <FileUploader onFilesUploaded={handleFilesUploaded} />

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <UploadedFiles
            files={uploadedFiles}
            onFileRemove={handleFileRemove}
          />
        )}

        {/* OCR Results */}
        {ocrResults && <OCRResults results={ocrResults} />}

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Medical Disclaimer
                </p>
                <p className="text-sm text-amber-700">
                  AI analysis is for informational purposes only. Always consult
                  with your healthcare provider for proper interpretation of
                  medical reports and treatment decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

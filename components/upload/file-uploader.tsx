"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
}

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesUploaded(acceptedFiles)
      setDragActive(false)
    },
    [onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "text/*": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  return (
    <Card>
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive || dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
          )}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{isDragActive ? "Drop files here" : "Upload Medical Reports"}</h3>
              <p className="text-muted-foreground">Drag and drop your files here, or click to browse</p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </div>
              <div className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-1" />
                Images
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Documents
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>

            <Button type="button" variant="outline">
              Choose Files
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

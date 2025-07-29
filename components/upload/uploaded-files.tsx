"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, ImageIcon, Trash2, CheckCircle, Clock } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: "processing" | "completed" | "error"
}

interface UploadedFilesProps {
  files: UploadedFile[]
  onFileRemove: (fileId: string) => void
}

export function UploadedFiles({ files, onFileRemove }: UploadedFilesProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    return FileText
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "processing":
        return Clock
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "processing":
        return "text-blue-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type)
            const StatusIcon = getStatusIcon(file.status)

            return (
              <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Button size="icon" variant="ghost" onClick={() => onFileRemove(file.id)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    <div className={`flex items-center text-xs ${getStatusColor(file.status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span className="capitalize">{file.status}</span>
                    </div>
                  </div>

                  {file.status === "processing" && <Progress value={65} className="h-1 mt-2" />}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

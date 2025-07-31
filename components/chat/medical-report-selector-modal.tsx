"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface MedicalReport {
  id: number;
  fileName: string;
  uploadedAt: string;
  extractedText: string;
}

interface MedicalReportSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (selectedReportIds: number[]) => void;
}

export function MedicalReportSelectionModal({
  isOpen,
  onClose,
  onStartChat,
}: MedicalReportSelectionModalProps) {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/medical-records");
      const data = await response.json();
      if (data.success) {
        setReports(data.records);
      }
    } catch (error) {
      console.error("Error fetching medical reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportToggle = (reportId: number) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleStartChat = () => {
    onStartChat(selectedReportIds);
    onClose();
    setSelectedReportIds([]); // Reset selection
  };

  const handleStartWithoutContext = () => {
    onStartChat([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You can start a chat with or without medical report context. Select
            reports to provide relevant context for your health discussion.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No medical reports found.</p>
              <p className="text-sm text-gray-400">
                Upload reports first to use them as context.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-medium mb-3">
                Select Medical Reports (Optional)
              </h3>
              <ScrollArea className="max-h-100 overflow-y-scroll">
                <div className="space-y-2">
                  {reports.map((report) => (
                    <Card
                      key={report.id}
                      className={`cursor-pointer transition-colors ${
                        selectedReportIds.includes(report.id)
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleReportToggle(report.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedReportIds.includes(report.id)}
                            onChange={() => handleReportToggle(report.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm truncate">
                                {report.fileName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(report.uploadedAt, "MMM dd, yyyy")}
                              </span>
                            </div>
                            {report.extractedText && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {report.extractedText.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {selectedReportIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <FileText className="h-3 w-3 mr-1" />
                {selectedReportIds.length} report(s) selected
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleStartWithoutContext}>
            Start Without Context
          </Button>
          <Button
            onClick={handleStartChat}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={loading}
          >
            Start Chat
            {selectedReportIds.length > 0 &&
              ` with ${selectedReportIds.length} Report(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

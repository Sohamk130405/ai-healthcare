"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface MedicalReport {
  id: number;
  reportName: string;
  reportType: string;
  uploadedAt: string;
  extractedText: string | null; // Assuming extractedText might be needed for display or confirmation
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
  const { toast } = useToast();
  const [medicalReports, setMedicalReports] = React.useState<MedicalReport[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [selectedReportIds, setSelectedReportIds] = React.useState<Set<number>>(
    new Set()
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const fetchMedicalReports = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/medical-records");
        const data = await response.json();
        if (data.success) {
          setMedicalReports(data.records);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load medical reports.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching medical reports:", error);
        toast({
          title: "Error",
          description: "Network error: Failed to load medical reports.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalReports();
  }, [isOpen, toast]);

  const handleCheckboxChange = (reportId: number, checked: boolean) => {
    setSelectedReportIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(reportId);
      } else {
        newSet.delete(reportId);
      }
      return newSet;
    });
  };

  const handleStartChatClick = () => {
    onStartChat(Array.from(selectedReportIds));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Start New Chat with Context</DialogTitle>
          <DialogDescription>
            Select medical reports to provide context to the AI assistant for
            this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading reports...</span>
            </div>
          ) : medicalReports.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>
                No medical reports found. Upload reports to use them as context.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {medicalReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center space-x-3 p-3 border rounded-md"
                  >
                    <Checkbox
                      id={`report-${report.id}`}
                      checked={selectedReportIds.has(report.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          report.id,
                          checked === true ? true : false
                        )
                      }
                    />
                    <Label
                      htmlFor={`report-${report.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium">{report.reportName}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.reportType} •{" "}
                        {format(parseISO(report.uploadedAt), "PPP")}
                      </p>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStartChatClick} disabled={loading}>
            Start Chat ({selectedReportIds.size} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

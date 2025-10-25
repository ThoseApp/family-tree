"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, ExternalLink, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PDFViewerProps {
  pdfUrl: string;
  pdfName?: string;
  className?: string;
  showPreview?: boolean;
  allowDownload?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  pdfName,
  className = "",
  showPreview = true,
  allowDownload = true,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* PDF Control Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-md">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {pdfName || "PDF Document"}
                </p>
                <p className="text-xs text-gray-500">PDF File</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="flex items-center"
                >
                  {isPreviewOpen ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show Preview
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>

              {allowDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {showPreview && isPreviewOpen && (
        <Card>
          <CardContent className="p-0">
            <div className="w-full h-96 md:h-[600px]">
              <iframe
                src={`${pdfUrl}#toolbar=1`}
                className="w-full h-full rounded-md"
                title={pdfName || "PDF Preview"}
                style={{ border: "none" }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFViewer;

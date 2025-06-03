"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Database,
  RefreshCw,
  Table as TableIcon,
  GitBranch,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// Types for Excel data
interface FamilyMember {
  "Picture Link": string;
  "Unique ID": string;
  Gender: string;
  "First Name": string;
  "Last Name": string;
  "Fathers' First Name": string;
  "Fathers' Last Name": string;
  "Mothers' First Name": string;
  "Mothers' Last Name": string;
  "Order of Birth": number;
  "Order of Marriage": number;
  "Marital Status": string;
  "Spouses' First Name": string;
  "Spouses' Last Name": string;
  "Date of Birth": string;
}

interface ProcessedMember {
  id?: number;
  picture_link: string;
  unique_id: string;
  gender: string;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  fathers_last_name: string;
  mothers_first_name: string;
  mothers_last_name: string;
  order_of_birth: number | null;
  order_of_marriage: number | null;
  marital_status: string;
  spouses_first_name: string;
  spouses_last_name: string;
  date_of_birth: string | null;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface FailedRecord {
  record: ProcessedMember;
  error: string;
  originalRow: number;
}

const FamilyTreeUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [excelData, setExcelData] = useState<FamilyMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
    failedRecords: FailedRecord[];
  } | null>(null);
  const [existingData, setExistingData] = useState<ProcessedMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  // Required columns mapping
  const requiredColumns = [
    "Picture Link",
    "Unique ID",
    "Gender",
    "First Name",
    "Last Name",
    "Fathers' First Name",
    "Fathers' Last Name",
    "Mothers' First Name",
    "Mothers' Last Name",
    "Order of Birth",
    "Order of Marriage",
    "Marital Status",
    "Spouses' First Name",
    "Spouses' Last Name",
    "Date of Birth",
  ];

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        const isExcel =
          selectedFile.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "application/vnd.ms-excel" ||
          selectedFile.name.endsWith(".xlsx") ||
          selectedFile.name.endsWith(".xls");

        const isCsv =
          selectedFile.type === "text/csv" ||
          selectedFile.name.endsWith(".csv");

        if (isExcel || isCsv) {
          setFile(selectedFile);
          setExcelData([]);
          setValidationErrors([]);
          setUploadResults(null);
        } else {
          toast.error(
            "Please select a valid Excel file (.xlsx, .xls) or CSV file (.csv)"
          );
        }
      }
    },
    []
  );

  const parseCSVFile = async (file: File): Promise<FamilyMember[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());

          if (lines.length === 0) {
            resolve([]);
            return;
          }

          // Parse CSV with basic quote handling
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];

              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }

            result.push(current.trim());
            return result;
          };

          const headers = parseCSVLine(lines[0]);
          const data: FamilyMember[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row: any = {};

            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });

            data.push(row as FamilyMember);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read CSV file"));
      reader.readAsText(file);
    });
  };

  const parseExcelFile = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(20);

    try {
      let jsonData: FamilyMember[] = [];

      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        // Parse CSV file
        jsonData = await parseCSVFile(file);
      } else {
        // Parse Excel file
        const XLSX = await import("xlsx");

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet) as FamilyMember[];
      }

      setUploadProgress(50);

      // Validate the data
      const errors = validateExcelData(jsonData);
      setValidationErrors(errors);
      setExcelData(jsonData);
      setUploadProgress(75);

      if (errors.length === 0) {
        toast.success(
          `Successfully parsed ${jsonData.length} records from ${
            file.name.endsWith(".csv") ? "CSV" : "Excel"
          } file`
        );
      } else {
        toast.warning(
          `Parsed ${jsonData.length} records with ${errors.length} validation errors`
        );
      }

      setUploadProgress(100);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file. Please check the file format.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [file]);

  const validateExcelData = (data: FamilyMember[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      // Check required fields - only unique_id is required now
      if (!row["Unique ID"]) {
        errors.push({
          row: index + 1,
          field: "Unique ID",
          message: "Unique ID is required",
        });
      }

      // Validate date format if provided
      if (row["Date of Birth"] && !isValidDate(row["Date of Birth"])) {
        errors.push({
          row: index + 1,
          field: "Date of Birth",
          message: "Invalid date format",
        });
      }

      // Validate gender values if provided
      if (
        row["Gender"] &&
        !["Male", "Female", "Other", "M", "F"].includes(row["Gender"])
      ) {
        errors.push({
          row: index + 1,
          field: "Gender",
          message: "Gender must be Male, Female, Other, M, or F",
        });
      }
    });

    return errors;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const processDataForDatabase = (data: FamilyMember[]): ProcessedMember[] => {
    return data.map((row) => ({
      picture_link: row["Picture Link"] || "",
      unique_id: row["Unique ID"],
      gender: row["Gender"] || "",
      first_name: row["First Name"] || "",
      last_name: row["Last Name"] || "",
      fathers_first_name: row["Fathers' First Name"] || "",
      fathers_last_name: row["Fathers' Last Name"] || "",
      mothers_first_name: row["Mothers' First Name"] || "",
      mothers_last_name: row["Mothers' Last Name"] || "",
      order_of_birth: row["Order of Birth"]
        ? Number(row["Order of Birth"])
        : null,
      order_of_marriage: row["Order of Marriage"]
        ? Number(row["Order of Marriage"])
        : null,
      marital_status: row["Marital Status"] || "",
      spouses_first_name: row["Spouses' First Name"] || "",
      spouses_last_name: row["Spouses' Last Name"] || "",
      date_of_birth:
        row["Date of Birth"] && isValidDate(row["Date of Birth"])
          ? new Date(row["Date of Birth"]).toISOString().split("T")[0]
          : null,
    }));
  };

  const uploadToSupabase = useCallback(async () => {
    if (!excelData.length || validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return;
    }

    setIsLoading(true);
    const processedData = processDataForDatabase(excelData);

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const failedRecords: FailedRecord[] = [];

    try {
      // Upload in batches to avoid overwhelming the server
      const batchSize = 50;
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        setUploadProgress((i / processedData.length) * 100);

        const { data, error } = await supabase
          .from("family-tree")
          .insert(batch)
          .select();

        if (error) {
          failedCount += batch.length;
          errors.push(
            `Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`
          );
          batch.forEach((record, index) => {
            failedRecords.push({
              record,
              error: error.message,
              originalRow: i + index + 1,
            });
          });
        } else {
          successCount += batch.length;
        }
      }

      setUploadResults({
        success: successCount,
        failed: failedCount,
        errors,
        failedRecords,
      });

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} family members`);
        // Refresh the existing data to show newly uploaded records
        refreshData();
      }
      if (failedCount > 0) {
        toast.error(`Failed to upload ${failedCount} records`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload data to database");
    } finally {
      setIsLoading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [excelData, validationErrors]);

  const downloadTemplate = () => {
    const template = requiredColumns.join(",") + "\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("family-tree")
        .select()
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to refresh data");
      } else {
        setExistingData(data as ProcessedMember[]);
        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data, error } = await supabase.from("family-tree").select();

        if (error) {
          console.error("Error fetching existing data:", error);
          toast.error("Failed to fetch existing data");
        } else {
          setExistingData(data as ProcessedMember[]);
          setIsLoadingData(false);
        }
      } catch (error) {
        console.error("Error fetching existing data:", error);
        toast.error("Failed to fetch existing data");
      }
    };

    fetchExistingData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Tree Data Upload</h1>
          <p className="text-muted-foreground">
            Upload Excel or CSV files to populate the family tree database
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Existing Data Display */}
      {!isLoadingData && existingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Existing Family Tree Data ({existingData.length} records)
              </span>
              <div className="flex items-center gap-2">
                {/* View Toggle Buttons */}
                <div className="flex rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-1"
                  >
                    <TableIcon className="h-4 w-4" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'tree' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('tree')}
                    className="flex items-center gap-1"
                  >
                    <GitBranch className="h-4 w-4" />
                    Tree
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoadingData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Current family members in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Unique ID</TableHead>
                        <TableHead className="min-w-[150px]">First Name</TableHead>
                        <TableHead className="min-w-[150px]">Last Name</TableHead>
                        <TableHead className="min-w-[80px]">Gender</TableHead>
                        <TableHead className="min-w-[120px]">Date of Birth</TableHead>
                        <TableHead className="min-w-[150px]">Father's First Name</TableHead>
                        <TableHead className="min-w-[150px]">Father's Last Name</TableHead>
                        <TableHead className="min-w-[150px]">Mother's First Name</TableHead>
                        <TableHead className="min-w-[150px]">Mother's Last Name</TableHead>
                        <TableHead className="min-w-[100px]">Order of Birth</TableHead>
                        <TableHead className="min-w-[120px]">Order of Marriage</TableHead>
                        <TableHead className="min-w-[120px]">Marital Status</TableHead>
                        <TableHead className="min-w-[150px]">Spouse's First Name</TableHead>
                        <TableHead className="min-w-[150px]">Spouse's Last Name</TableHead>
                        <TableHead className="min-w-[200px]">Picture Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {existingData.map((member, index) => (
                        <TableRow key={member.id || index}>
                          <TableCell className="font-medium">
                            {member.unique_id}
                          </TableCell>
                          <TableCell>{member.first_name}</TableCell>
                          <TableCell>{member.last_name}</TableCell>
                          <TableCell>{member.gender}</TableCell>
                          <TableCell>
                            {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : ''}
                          </TableCell>
                          <TableCell>{member.fathers_first_name}</TableCell>
                          <TableCell>{member.fathers_last_name}</TableCell>
                          <TableCell>{member.mothers_first_name}</TableCell>
                          <TableCell>{member.mothers_last_name}</TableCell>
                          <TableCell>{member.order_of_birth}</TableCell>
                          <TableCell>{member.order_of_marriage}</TableCell>
                          <TableCell>{member.marital_status}</TableCell>
                          <TableCell>{member.spouses_first_name}</TableCell>
                          <TableCell>{member.spouses_last_name}</TableCell>
                          <TableCell>
                            {member.picture_link && (
                              <a 
                                href={member.picture_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[180px]"
                              >
                                {member.picture_link}
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tree View Coming Soon</h3>
                <p className="text-gray-500">
                  The family tree visualization will be implemented here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoadingData && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading existing data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
          <CardDescription>
            Select an Excel file CSV file (.csv) containing family member data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="excel-file">Excel or CSV File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {file.name.endsWith(".csv") ? "CSV" : "Excel"} File
                  </p>
                </div>
              </div>
              <Button onClick={parseExcelFile} disabled={isLoading}>
                {isLoading ? "Parsing..." : "Parse File"}
              </Button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={Math.round(uploadProgress)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    Row {error.row}, {error.field}: {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {excelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Data Preview ({excelData.length} records)
              </span>
              <div className="flex gap-2">
                <Badge
                  variant={
                    validationErrors.length > 0 ? "destructive" : "default"
                  }
                >
                  {validationErrors.length} Errors
                </Badge>
                <Button
                  onClick={uploadToSupabase}
                  disabled={isLoading || validationErrors.length > 0}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Uploading..." : "Upload to Database"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unique ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Father</TableHead>
                      <TableHead>Mother</TableHead>
                      <TableHead>Spouse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.slice(0, 10).map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {member["Unique ID"]}
                        </TableCell>
                        <TableCell>
                          {member["First Name"]} {member["Last Name"]}
                        </TableCell>
                        <TableCell>{member["Gender"]}</TableCell>
                        <TableCell>{member["Date of Birth"]}</TableCell>
                        <TableCell>
                          {member["Fathers' First Name"]}{" "}
                          {member["Fathers' Last Name"]}
                        </TableCell>
                        <TableCell>
                          {member["Mothers' First Name"]}{" "}
                          {member["Mothers' Last Name"]}
                        </TableCell>
                        <TableCell>
                          {member["Spouses' First Name"]}{" "}
                          {member["Spouses' Last Name"]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {excelData.length > 10 && (
                <div className="p-4 text-center text-muted-foreground border-t">
                  Showing first 10 of {excelData.length} records
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResults.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResults.success}
                </div>
                <div className="text-sm text-muted-foreground">
                  Successfully Uploaded
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResults.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Upload Errors:</h4>
                {uploadResults.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {uploadResults.failedRecords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">
                  Failed Records ({uploadResults.failedRecords.length}):
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row #</TableHead>
                          <TableHead>Unique ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadResults.failedRecords.map(
                          (failedRecord, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {failedRecord.originalRow}
                              </TableCell>
                              <TableCell>
                                {failedRecord.record.unique_id}
                              </TableCell>
                              <TableCell>
                                {failedRecord.record.first_name}{" "}
                                {failedRecord.record.last_name}
                              </TableCell>
                              <TableCell className="text-red-600 text-sm">
                                {failedRecord.error}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyTreeUploadPage;

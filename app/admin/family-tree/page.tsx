"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
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
  Search,
  X,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import FamilyTreeErrorBoundary from "@/components/family-tree-error-boundary";

// Import family-chart library
// @ts-ignore - family-chart doesn't have type definitions
let f3: any = null;

// Dynamic import for family-chart to handle production issues
const loadFamilyChart = async (retryCount = 0): Promise<any> => {
  try {
    if (typeof window !== "undefined") {
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Library load timeout")), 10000);
      });

      const importPromise = import("family-chart");
      const familyChartModule = (await Promise.race([
        importPromise,
        timeoutPromise,
      ])) as any;

      f3 = familyChartModule.default || familyChartModule;
      console.log("Family-chart loaded successfully:", f3);
      return f3;
    }
  } catch (error) {
    console.error(
      `Failed to load family-chart library (attempt ${retryCount + 1}):`,
      error
    );

    // Retry up to 2 times with exponential backoff
    if (retryCount < 2) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return loadFamilyChart(retryCount + 1);
    }

    return null;
  }
  return null;
};

// Types for Excel data
interface FamilyMember {
  "Picture Link": string;
  "Unique ID": string;
  Gender: string;
  "First Name": string;
  "Last Name": string;
  "Fathers' First Name": string;
  "Fathers' Last Name": string;
  "Fathers' UID": string;
  "Mothers' First Name": string;
  "Mothers' Last Name": string;
  "Mothers' UID": string;
  "Order of Birth (Motherline)": number;
  "Order of Marriage": number;
  "Marital Status": string;
  "Spouses' First Name": string;
  "Spouses' Last Name": string;
  "Spouse UID": string;
  "Date of Birth": string;
  "Life Status": string;
  "Email Address": string;
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
  fathers_uid?: string;
  mothers_first_name: string;
  mothers_last_name: string;
  mothers_uid?: string;
  order_of_birth: number | null;
  order_of_marriage: number | null;
  marital_status: string;
  spouses_first_name: string;
  spouses_last_name: string;
  spouse_uid?: string;
  date_of_birth: string | null;
  life_status: "Alive" | "Deceased";
  email_address?: string;
}

// Family Chart data format
interface FamilyChartMember {
  id: string;
  data: {
    first_name: string;
    last_name: string;
    birthday: string;
    avatar: string;
    gender: string;
    unique_id: string;
    order_of_birth?: number | null;
    order_of_marriage?: number | null;
    marital_status?: string;
    isOriginator?: boolean;
    isTwin?: boolean;
    isPolygamous?: boolean;
    isOutOfWedlock?: boolean;
    lineageColor?: string;
  };
  rels: {
    father?: string;
    mother?: string;
    spouses?: string[];
    children?: string[];
  };
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

interface AccountCreationResult {
  familyMemberId: string;
  firstName: string;
  lastName: string;
  email?: string;
  status: "created" | "failed" | "skipped_deceased" | "skipped_invalid_email";
  userId?: string;
  password?: string;
  error?: string;
}

// Color scheme for the 4 main lineages
const LINEAGE_COLORS = {
  LAKETU: "#8B4513", // Brown for originator
  EGUNDEBI: "#DC2626", // Red for Egundebi
  EGUNDEBI_MALE_CHILD_1: "#059669", // Green
  EGUNDEBI_MALE_CHILD_2: "#2563EB", // Blue
  EGUNDEBI_MALE_CHILD_3: "#7C3AED", // Purple
  EGUNDEBI_FEMALE_CHILD: "#FBBF24", // Yellow
  DEFAULT: "#6B7280", // Gray for others/spouses
};

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
    skippedExisting?: number;
    skippedExistingIds?: string[];
    accountResults?: {
      success: number;
      failed: number;
      skipped: number;
      results: AccountCreationResult[];
    };
  } | null>(null);
  const [existingData, setExistingData] = useState<ProcessedMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [familyChartData, setFamilyChartData] = useState<FamilyChartMember[]>(
    []
  );
  const [isInitializingChart, setIsInitializingChart] = useState(false);
  const [chartLoadRetries, setChartLoadRetries] = useState(0);
  const [familyChartAvailable, setFamilyChartAvailable] = useState<
    boolean | null
  >(null);
  const lineageColorCache = useRef(new Map<string, string>());

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedMember[]>([]);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    searchInNames: true,
    searchInIds: true,
    searchInDates: true,
    searchInRelations: true,
  });

  // Ref for the family chart container
  const familyTreeRef = useRef<HTMLDivElement>(null);
  const familyChartInstance = useRef<any>(null);

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
    "Order of Birth (Motherline)",
    "Order of Marriage",
    "Marital Status",
    "Spouses' First Name",
    "Spouses' Last Name",
    "Date of Birth",
    "Life Status",
    "Email Address",
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
        jsonData = await parseCSVFile(file);
      } else {
        const XLSX = await import("xlsx");

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet) as FamilyMember[];
      }

      setUploadProgress(50);

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

    // Track duplicates within the uploaded file
    const seenIdsInUpload = new Map<string, number>();

    data.forEach((row, index) => {
      if (!row["Unique ID"]) {
        errors.push({
          row: index + 1,
          field: "Unique ID",
          message: "Unique ID is required",
        });
      }

      // Validate duplicate Unique IDs within the uploaded file
      const currentId = (row["Unique ID"] || "").trim();
      if (currentId) {
        if (seenIdsInUpload.has(currentId)) {
          const firstRow = seenIdsInUpload.get(currentId)!;
          errors.push({
            row: index + 1,
            field: "Unique ID",
            message: `Duplicate Unique ID in upload: '${currentId}' already used in row ${
              firstRow + 1
            }`,
          });
        } else {
          seenIdsInUpload.set(currentId, index);
        }
      }

      if (row["Date of Birth"] && !isValidDate(row["Date of Birth"])) {
        errors.push({
          row: index + 1,
          field: "Date of Birth",
          message: "Invalid date format",
        });
      }

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

      // Validate Life Status
      if (
        row["Life Status"] &&
        !["Alive", "Deceased", "alive", "deceased"].includes(row["Life Status"])
      ) {
        errors.push({
          row: index + 1,
          field: "Life Status",
          message: "Life Status must be 'Alive' or 'Deceased'",
        });
      }

      // Validate Email Address format if provided
      if (row["Email Address"] && row["Email Address"].trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row["Email Address"].trim())) {
          errors.push({
            row: index + 1,
            field: "Email Address",
            message: "Invalid email format",
          });
        }
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
      fathers_uid: row["Fathers' UID"] || undefined,
      mothers_first_name: row["Mothers' First Name"] || "",
      mothers_last_name: row["Mothers' Last Name"] || "",
      mothers_uid: row["Mothers' UID"] || undefined,
      order_of_birth: row["Order of Birth (Motherline)"]
        ? Number(row["Order of Birth (Motherline)"])
        : null,
      order_of_marriage: row["Order of Marriage"]
        ? Number(row["Order of Marriage"])
        : null,
      marital_status: row["Marital Status"] || "",
      spouses_first_name: row["Spouses' First Name"] || "",
      spouses_last_name: row["Spouses' Last Name"] || "",
      spouse_uid: row["Spouse UID"] || undefined,
      date_of_birth:
        row["Date of Birth"] && isValidDate(row["Date of Birth"])
          ? new Date(row["Date of Birth"]).toISOString().split("T")[0]
          : null,
      life_status: (row["Life Status"]?.toLowerCase() === "deceased"
        ? "Deceased"
        : "Alive") as "Alive" | "Deceased",
      email_address: row["Email Address"]?.trim() || undefined,
    }));
  };

  const uploadToSupabase = useCallback(async () => {
    if (!excelData.length) {
      toast.error("No data to upload");
      return;
    }

    // Re-run validation at upload time to catch any duplicates or changes
    const freshValidationErrors = validateExcelData(excelData);
    if (freshValidationErrors.length > 0) {
      setValidationErrors(freshValidationErrors);
      toast.error("Please fix validation errors before uploading");
      return;
    }

    setIsLoading(true);
    const processedData = processDataForDatabase(excelData);

    // Skip records that already exist in DB by Unique ID
    const existingIds = new Set(
      (existingData || [])
        .map((m) => (m.unique_id || "").trim())
        .filter(Boolean)
    );
    const toInsert = processedData.filter(
      (m) => m.unique_id && !existingIds.has((m.unique_id || "").trim())
    );
    const skippedExistingRecords = processedData.filter((m) =>
      existingIds.has((m.unique_id || "").trim())
    );

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const failedRecords: FailedRecord[] = [];

    // Account creation tracking
    const accountResults: AccountCreationResult[] = [];
    let accountsCreated = 0;
    let accountsFailed = 0;
    let accountsSkipped = 0;

    try {
      // Phase 1: Upload family tree data
      const batchSize = 50;
      const totalSteps = toInsert.length || 1;
      let currentStep = 0;

      // Inform about skipped records due to existing IDs
      if (skippedExistingRecords.length > 0) {
        toast.info(
          `Skipping ${skippedExistingRecords.length} record(s) with existing Unique IDs`
        );
      }

      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        setUploadProgress((currentStep / totalSteps) * 50); // First 50% for family data upload

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

        currentStep += batch.length;
      }

      // Phase 2: Create accounts for eligible family members
      if (successCount > 0) {
        toast.info("Family data uploaded! Now creating accounts...");

        // Filter members eligible for account creation
        const eligibleMembers = toInsert.filter(
          (member) =>
            member.life_status === "Alive" &&
            member.email_address &&
            member.email_address.trim() !== ""
        );

        console.log(
          `Found ${eligibleMembers.length} eligible members for account creation`
        );

        for (let i = 0; i < eligibleMembers.length; i++) {
          const member = eligibleMembers[i];
          setUploadProgress(50 + (i / eligibleMembers.length) * 50); // Second 50% for account creation

          try {
            // Validate email format before attempting creation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(member.email_address!)) {
              accountResults.push({
                familyMemberId: member.unique_id,
                firstName: member.first_name,
                lastName: member.last_name,
                email: member.email_address,
                status: "skipped_invalid_email",
              });
              accountsSkipped++;
              continue;
            }

            // Call the existing create-family-accounts API
            const response = await fetch("/api/admin/create-family-accounts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                familyMemberId: member.unique_id,
                firstName: member.first_name,
                lastName: member.last_name,
                email: member.email_address,
                phoneNumber: "", // Optional - can be added to family tree if needed
                dateOfBirth: member.date_of_birth || undefined,
              }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              accountResults.push({
                familyMemberId: member.unique_id,
                firstName: member.first_name,
                lastName: member.last_name,
                email: member.email_address,
                status: "created",
                userId: result.userId,
                password: result.password,
              });
              accountsCreated++;
            } else {
              accountResults.push({
                familyMemberId: member.unique_id,
                firstName: member.first_name,
                lastName: member.last_name,
                email: member.email_address,
                status: "failed",
                error: result.message || "Account creation failed",
              });
              accountsFailed++;
            }
          } catch (accountError) {
            console.error(
              `Error creating account for ${member.unique_id}:`,
              accountError
            );
            accountResults.push({
              familyMemberId: member.unique_id,
              firstName: member.first_name,
              lastName: member.last_name,
              email: member.email_address,
              status: "failed",
              error:
                accountError instanceof Error
                  ? accountError.message
                  : "Unknown error",
            });
            accountsFailed++;
          }
        }
      }

      // Set comprehensive results
      setUploadResults({
        success: successCount,
        failed: failedCount,
        errors,
        failedRecords,
        skippedExisting: skippedExistingRecords.length,
        skippedExistingIds: skippedExistingRecords.map((r) => r.unique_id),
        accountResults: {
          success: accountsCreated,
          failed: accountsFailed,
          skipped: accountsSkipped,
          results: accountResults,
        },
      });

      // Show success messages
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} family members`);

        if (accountsCreated > 0) {
          toast.success(`Created ${accountsCreated} user accounts`);
        }

        if (accountsSkipped > 0) {
          toast.info(
            `Skipped ${accountsSkipped} accounts (deceased members or invalid emails)`
          );
        }

        if (accountsFailed > 0) {
          toast.warning(`Failed to create ${accountsFailed} accounts`);
        }

        refreshData();
      }

      if (failedCount > 0) {
        toast.error(`Failed to upload ${failedCount} family records`);
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
    const templateHeader = requiredColumns.join(",");
    const sampleData = [
      '"https://example.com/laketu.jpg","LAKETU","Male","LAKETU","MOSURO","","","","","0","0","Single","","","1850-01-01","Deceased",""',
      '"https://example.com/egundebi.jpg","EGUNDEBI","Male","EGUNDEBI","MOSURO","LAKETU","MOSURO","","","1","1","Married","ABIKE","ADEBAYO","1875-03-15","Deceased",""',
      '"https://example.com/abike.jpg","S001","Female","ABIKE","ADEBAYO","","","","","0","0","Married","EGUNDEBI","MOSURO","1878-06-20","Deceased",""',
      '"https://example.com/adelaja.jpg","D001","Male","ADELAJA","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","1","1","Married","FOLAKE","OGUNDIMU","1900-01-10","Deceased",""',
      '"https://example.com/adunni.jpg","D002","Female","ADUNNI","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","2","0","Married","BABATUNDE","OGUNDIMU","1902-05-18","Deceased",""',
      '"https://example.com/adebayo.jpg","D003","Male","ADEBAYO","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","3","1","Married","KEMI","ADEYEMI","1904-08-25","Deceased",""',
      '"https://example.com/aduke.jpg","D004","Female","ADUKE","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","4","0","Married","TAIWO","ADEYEMI","1906-12-30","Deceased",""',
      '"https://example.com/folake.jpg","S002","Female","FOLAKE","OGUNDIMU","","","","","0","0","Married","ADELAJA","MOSURO","1903-02-14","Deceased",""',
      '"https://example.com/babatunde.jpg","S003","Male","BABATUNDE","OGUNDIMU","","","","","0","0","Married","ADUNNI","MOSURO","1899-09-12","Deceased",""',
      '"https://example.com/kemi.jpg","S004","Female","KEMI","ADEYEMI","","","","","0","0","Married","ADEBAYO","MOSURO","1907-04-03","Deceased",""',
      '"https://example.com/taiwo.jpg","S005","Male","TAIWO","ADEYEMI","","","","","0","0","Married","ADUKE","MOSURO","1905-11-22","Deceased",""',
      '"https://example.com/adeola.jpg","D005","Male","ADEOLA","MOSURO","ADELAJA","MOSURO","FOLAKE","OGUNDIMU","1","1","Single","","","1925-07-08","Alive","adeola.mosuro@example.com"',
      '"https://example.com/adebisi.jpg","D006","Female","ADEBISI","MOSURO","ADELAJA","MOSURO","FOLAKE","OGUNDIMU","2","0","Single","","","1927-11-15","Alive","adebisi.mosuro@example.com"',
      '"https://example.com/kehinde.jpg","D007","Male","KEHINDE","OGUNDIMU","BABATUNDE","OGUNDIMU","ADUNNI","MOSURO","1","1","Single","","","1930-03-20","Alive","kehinde.ogundimu@example.com"',
      '"https://example.com/taiye.jpg","D008","Male","TAIYE","OGUNDIMU","BABATUNDE","OGUNDIMU","ADUNNI","MOSURO","1","1","Single","","","1930-03-20","Alive","taiye.ogundimu@example.com"',
      '"https://example.com/adebayo_child1.jpg","D009","Male","ADEBAYO_JR","MOSURO","ADEBAYO","MOSURO","KEMI","ADEYEMI","1","1","Single","","","1932-01-12","Alive","adebayo.jr@example.com"',
      '"https://example.com/second_wife.jpg","S006","Female","FUNMI","ADEYEMI","","","","","0","2","Married","ADEBAYO","MOSURO","1910-08-17","Deceased",""',
      '"https://example.com/adebayo_child2.jpg","D010","Female","FUNMILAYO","MOSURO","ADEBAYO","MOSURO","FUNMI","ADEYEMI","1","0","Single","","","1935-06-05","Alive","funmilayo.mosuro@example.com"',
    ];

    const csvContent = templateHeader + "\n" + sampleData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree-template-with-sample-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(
      "Downloaded CSV template with sample family tree data demonstrating all business rules"
    );
  };

  // Add function to validate source data for LAKETU-EGUNDEBI relationship
  const validateSourceDataRelationships = (data: ProcessedMember[]) => {
    console.log("=== VALIDATING SOURCE DATA RELATIONSHIPS ===");

    const laketu = data.find(
      (m) =>
        m.unique_id === "LAKETU" || m.first_name?.toUpperCase() === "LAKETU"
    );
    const egundebi = data.find(
      (m) =>
        m.unique_id === "EGUNDEBI" || m.first_name?.toUpperCase() === "EGUNDEBI"
    );

    console.log(
      "LAKETU in source data:",
      laketu
        ? {
            unique_id: laketu.unique_id,
            first_name: laketu.first_name,
            last_name: laketu.last_name,
            fathers_first_name: laketu.fathers_first_name,
            fathers_last_name: laketu.fathers_last_name,
          }
        : "NOT FOUND"
    );

    console.log(
      "EGUNDEBI in source data:",
      egundebi
        ? {
            unique_id: egundebi.unique_id,
            first_name: egundebi.first_name,
            last_name: egundebi.last_name,
            fathers_first_name: egundebi.fathers_first_name,
            fathers_last_name: egundebi.fathers_last_name,
            relationshipCorrect:
              egundebi.fathers_first_name?.toUpperCase() === "LAKETU",
          }
        : "NOT FOUND"
    );

    // Check if EGUNDEBI correctly references LAKETU as father
    if (egundebi && laketu) {
      const hasCorrectFatherName =
        egundebi.fathers_first_name?.toUpperCase() === "LAKETU" ||
        egundebi.fathers_first_name?.toUpperCase() ===
          laketu.first_name?.toUpperCase();
      const hasCorrectFatherLastName =
        egundebi.fathers_last_name?.toUpperCase() === "MOSURO" ||
        egundebi.fathers_last_name?.toUpperCase() ===
          laketu.last_name?.toUpperCase();

      console.log("EGUNDEBI->LAKETU relationship validation:", {
        hasCorrectFatherName,
        hasCorrectFatherLastName,
        isValid: hasCorrectFatherName && hasCorrectFatherLastName,
      });

      if (!hasCorrectFatherName || !hasCorrectFatherLastName) {
        console.warn(
          "⚠️ EGUNDEBI does not correctly reference LAKETU as father in source data!"
        );
        console.warn(
          "Expected: fathers_first_name='LAKETU', fathers_last_name='MOSURO'"
        );
        console.warn(
          `Actual: fathers_first_name='${egundebi.fathers_first_name}', fathers_last_name='${egundebi.fathers_last_name}'`
        );
      }
    }

    return { laketu, egundebi };
  };

  const refreshData = async () => {
    setIsLoadingData(true);
    lineageColorCache.current.clear();
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
      setIsLoadingData(true);
      lineageColorCache.current.clear();
      try {
        const { data, error } = await supabase.from("family-tree").select();

        if (error) {
          console.error("Error fetching existing data:", error);
          toast.error("Failed to fetch existing data");
        } else {
          setExistingData(data as ProcessedMember[]);
        }
      } catch (error) {
        console.error("Error fetching existing data:", error);
        toast.error("Failed to fetch existing data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExistingData();
  }, []);

  // Check if family-chart library is available
  useEffect(() => {
    const checkFamilyChartAvailability = async () => {
      try {
        console.log("Checking family-chart availability...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Window object available:", typeof window !== "undefined");

        const familyChart = await loadFamilyChart();
        setFamilyChartAvailable(!!familyChart);

        if (familyChart) {
          console.log("Family-chart library is available and ready");
        } else {
          console.warn("Family-chart library is not available");
        }
      } catch (error) {
        console.error("Error checking family-chart availability:", error);
        setFamilyChartAvailable(false);
      }
    };

    checkFamilyChartAvailability();
  }, []);

  const getLineageColor = useCallback(
    (member: ProcessedMember, allMembers: ProcessedMember[]): string => {
      const uid = member.unique_id;

      if (lineageColorCache.current.has(uid)) {
        return lineageColorCache.current.get(uid)!;
      }

      // Helper to find member by name
      const findMemberByName = (firstName: string, lastName: string) => {
        return allMembers.find(
          (m) =>
            m.first_name?.toLowerCase().trim() ===
              firstName.toLowerCase().trim() &&
            m.last_name?.toLowerCase().trim() === lastName.toLowerCase().trim()
        );
      };

      // Rule 1: Originator (LAKETU)
      if (uid === "LAKETU" || member.first_name?.toUpperCase() === "LAKETU") {
        lineageColorCache.current.set(uid, LINEAGE_COLORS.LAKETU);
        return LINEAGE_COLORS.LAKETU;
      }

      // Rule 2: Egundebi (ID D01Z00002) is red
      if (
        uid === "D01Z00002" ||
        uid === "EGUNDEBI" ||
        member.first_name?.toUpperCase() === "EGUNDEBI"
      ) {
        lineageColorCache.current.set(uid, LINEAGE_COLORS.EGUNDEBI);
        return LINEAGE_COLORS.EGUNDEBI;
      }

      // Find father
      let father: ProcessedMember | undefined;
      if (member.fathers_first_name && member.fathers_last_name) {
        father = findMemberByName(
          member.fathers_first_name,
          member.fathers_last_name
        );
      }

      // Special case for Egundebi's father
      if (
        !father &&
        (uid === "D01Z00002" ||
          uid === "EGUNDEBI" ||
          member.first_name?.toUpperCase() === "EGUNDEBI")
      ) {
        father = allMembers.find(
          (m) =>
            m.unique_id === "LAKETU" || m.first_name?.toUpperCase() === "LAKETU"
        );
      }

      if (father) {
        const fatherUid = father.unique_id;
        const fatherIsEgundebi =
          fatherUid === "D01Z00002" ||
          fatherUid === "EGUNDEBI" ||
          father.first_name?.toUpperCase() === "EGUNDEBI";

        // Rule 3: Children of Egundebi
        if (fatherIsEgundebi) {
          const isFemale =
            member.gender?.toLowerCase() === "female" ||
            member.gender?.toLowerCase() === "f";
          let color;

          if (isFemale) {
            color = LINEAGE_COLORS.EGUNDEBI_FEMALE_CHILD;
          } else {
            // Male children
            const maleChildrenOfEgundebi = allMembers
              .filter((m) => {
                const isChild =
                  (m.fathers_first_name?.toLowerCase().trim() ===
                    father!.first_name?.toLowerCase().trim() &&
                    m.fathers_last_name?.toLowerCase().trim() ===
                      father!.last_name?.toLowerCase().trim()) ||
                  (m.mothers_first_name?.toLowerCase().trim() ===
                    father!.first_name?.toLowerCase().trim() &&
                    m.mothers_last_name?.toLowerCase().trim() ===
                      father!.last_name?.toLowerCase().trim());
                return (
                  isChild &&
                  (m.gender?.toLowerCase() === "male" ||
                    m.gender?.toLowerCase() === "m")
                );
              })
              .sort(
                (a, b) => (a.order_of_birth || 99) - (b.order_of_birth || 99)
              );

            const maleIndex = maleChildrenOfEgundebi.findIndex(
              (m) => m.unique_id === uid
            );

            switch (maleIndex) {
              case 0:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_1;
                break;
              case 1:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_2;
                break;
              case 2:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_3;
                break;
              default:
                color = LINEAGE_COLORS.DEFAULT;
            }
          }
          lineageColorCache.current.set(uid, color);
          return color;
        }

        // Rule 4: Male descendants inherit father's color
        const isMale =
          member.gender?.toLowerCase() === "male" ||
          member.gender?.toLowerCase() === "m";
        if (isMale) {
          const isOriginator =
            member.unique_id === "LAKETU" ||
            member.first_name?.toUpperCase() === "LAKETU";
          const isSpouseByRules =
            (!isOriginator &&
              (!member.fathers_first_name || !member.mothers_first_name)) ||
            (!isOriginator &&
              (member.order_of_birth === null || member.order_of_birth === 0));
          const isSpouse =
            member.unique_id?.charAt(0).toUpperCase() === "S" ||
            isSpouseByRules;

          if (!isSpouse) {
            const fatherColor = getLineageColor(father, allMembers);
            lineageColorCache.current.set(uid, fatherColor);
            return fatherColor;
          }
        }
      }

      // Default for spouses and females not covered by other rules
      lineageColorCache.current.set(uid, LINEAGE_COLORS.DEFAULT);
      return LINEAGE_COLORS.DEFAULT;
    },
    []
  );

  // Business Rules Logic
  const applyBusinessRules = useCallback(
    (member: ProcessedMember, allMembers: ProcessedMember[]) => {
      const uid = member.unique_id;

      const isOriginator =
        uid === "LAKETU" || member.first_name?.toUpperCase() === "LAKETU";

      const isTwin =
        allMembers.filter(
          (m) =>
            m.unique_id !== member.unique_id &&
            m.fathers_first_name === member.fathers_first_name &&
            m.fathers_last_name === member.fathers_last_name &&
            m.mothers_first_name === member.mothers_first_name &&
            m.mothers_last_name === member.mothers_last_name &&
            m.order_of_birth === member.order_of_birth &&
            m.order_of_birth !== null &&
            m.order_of_birth !== 0
        ).length > 0;

      const isPolygamous =
        member.gender?.toLowerCase() === "male" &&
        member.order_of_marriage !== null &&
        member.order_of_marriage > 1 &&
        member.marital_status?.toLowerCase() === "married";

      const isOutOfWedlock =
        (!member.fathers_first_name || !member.fathers_last_name) &&
        (!member.mothers_first_name || !member.mothers_last_name);

      const isSpouseByRules =
        (!isOriginator &&
          (!member.fathers_first_name || !member.mothers_first_name)) ||
        (!isOriginator &&
          (member.order_of_birth === null || member.order_of_birth === 0));

      const lineageColor = getLineageColor(member, allMembers);

      return {
        isOriginator,
        isDescendant:
          uid?.charAt(0).toUpperCase() === "D" ||
          (!isSpouseByRules &&
            member.unique_id?.charAt(0).toUpperCase() !== "S"),
        isSpouse:
          member.unique_id?.charAt(0).toUpperCase() === "S" || isSpouseByRules,
        isTwin,
        isPolygamous,
        isOutOfWedlock,
        lineageColor,
      };
    },
    [getLineageColor]
  );

  // Convert ProcessedMember data to FamilyChart format
  const convertToFamilyChartFormat = useCallback(
    (members: ProcessedMember[]): FamilyChartMember[] => {
      console.log("Converting family data - total members:", members.length);

      // Create a lookup map for faster searching
      const memberMap = new Map<string, ProcessedMember>();
      const nameMap = new Map<string, ProcessedMember>();

      members.forEach((member) => {
        memberMap.set(member.unique_id, member);
        const nameKey = `${member.first_name?.toLowerCase()}_${member.last_name?.toLowerCase()}`;
        nameMap.set(nameKey, member);
      });

      const chartMembers = members.map((member) => {
        const rules = applyBusinessRules(member, members);

        // Find father
        let father: ProcessedMember | undefined;
        if (member.fathers_first_name && member.fathers_last_name) {
          const fatherKey = `${member.fathers_first_name.toLowerCase()}_${member.fathers_last_name.toLowerCase()}`;
          father = nameMap.get(fatherKey);

          if (!father) {
            father = members.find(
              (m) =>
                m.first_name?.toLowerCase().trim() ===
                  member.fathers_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.fathers_last_name?.toLowerCase().trim()
            );
          }

          // Special case for EGUNDEBI->LAKETU relationship
          if (
            !father &&
            (member.unique_id === "EGUNDEBI" ||
              member.first_name?.toUpperCase() === "EGUNDEBI")
          ) {
            father = members.find(
              (m) =>
                m.unique_id === "LAKETU" ||
                m.first_name?.toUpperCase() === "LAKETU"
            );
          }
        }

        // Find mother
        let mother: ProcessedMember | undefined;
        if (member.mothers_first_name && member.mothers_last_name) {
          const motherKey = `${member.mothers_first_name.toLowerCase()}_${member.mothers_last_name.toLowerCase()}`;
          mother = nameMap.get(motherKey);

          if (!mother) {
            mother = members.find(
              (m) =>
                m.first_name?.toLowerCase().trim() ===
                  member.mothers_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.mothers_last_name?.toLowerCase().trim()
            );
          }
        }

        // Find spouses
        const spouses: string[] = [];
        if (member.spouses_first_name && member.spouses_last_name) {
          const spouseKey = `${member.spouses_first_name.toLowerCase()}_${member.spouses_last_name.toLowerCase()}`;
          let spouse = nameMap.get(spouseKey);

          if (!spouse) {
            spouse = members.find(
              (m) =>
                m.unique_id !== member.unique_id &&
                m.first_name?.toLowerCase().trim() ===
                  member.spouses_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.spouses_last_name?.toLowerCase().trim()
            );
          }

          if (spouse) {
            spouses.push(spouse.unique_id);
          }
        }

        // Find back-reference spouses
        const backRefSpouses = members.filter(
          (m) =>
            m.unique_id !== member.unique_id &&
            m.spouses_first_name?.toLowerCase().trim() ===
              member.first_name?.toLowerCase().trim() &&
            m.spouses_last_name?.toLowerCase().trim() ===
              member.last_name?.toLowerCase().trim()
        );

        backRefSpouses.forEach((spouse) => {
          if (!spouses.includes(spouse.unique_id)) {
            spouses.push(spouse.unique_id);
          }
        });

        // Find children
        const children = members
          .filter((m) => {
            const isFatherMatch =
              m.fathers_first_name?.toLowerCase().trim() ===
                member.first_name?.toLowerCase().trim() &&
              m.fathers_last_name?.toLowerCase().trim() ===
                member.last_name?.toLowerCase().trim();

            const isMotherMatch =
              m.mothers_first_name?.toLowerCase().trim() ===
                member.first_name?.toLowerCase().trim() &&
              m.mothers_last_name?.toLowerCase().trim() ===
                member.last_name?.toLowerCase().trim();

            // Special case: Ensure LAKETU is recognized as EGUNDEBI's father
            const isSpecialCase =
              (member.unique_id === "LAKETU" ||
                member.first_name?.toUpperCase() === "LAKETU") &&
              (m.unique_id === "EGUNDEBI" ||
                m.first_name?.toUpperCase() === "EGUNDEBI");

            return isFatherMatch || isMotherMatch || isSpecialCase;
          })
          .map((child) => child.unique_id);

        const chartMember: FamilyChartMember = {
          id: member.unique_id,
          data: {
            first_name: member.first_name || "",
            last_name: member.last_name || "",
            birthday: member.date_of_birth || "",
            avatar: member.picture_link || "",
            gender: member.gender?.toLowerCase() || "unknown",
            unique_id: member.unique_id,
            order_of_birth: member.order_of_birth,
            order_of_marriage: member.order_of_marriage,
            marital_status: member.marital_status,
            ...rules,
          },
          rels: {
            father: father?.unique_id,
            mother: mother?.unique_id,
            spouses: spouses.length > 0 ? spouses : undefined,
            children: children.length > 0 ? children : undefined,
          },
        };

        return chartMember;
      });

      // Apply bidirectional relationship fixing
      return applyBidirectionalRelationshipFix(chartMembers);
    },
    [applyBusinessRules]
  );

  // Add bidirectional relationship fixing function
  const applyBidirectionalRelationshipFix = (
    chartData: FamilyChartMember[]
  ): FamilyChartMember[] => {
    console.log("=== APPLYING BIDIRECTIONAL RELATIONSHIP FIX ===");

    // Create a deep copy to avoid mutating original data
    const fixedData = chartData.map((member) => ({
      ...member,
      rels: {
        ...member.rels,
        children: member.rels.children ? [...member.rels.children] : undefined,
        spouses: member.rels.spouses ? [...member.rels.spouses] : undefined,
      },
    }));

    // First pass: Ensure all children have proper parent references
    fixedData.forEach((member) => {
      if (member.rels.children) {
        member.rels.children.forEach((childId) => {
          const child = fixedData.find((d) => d.id === childId);
          if (child) {
            // Set father/mother relationship based on gender
            if (member.data.gender === "male" || member.data.gender === "m") {
              if (!child.rels.father) {
                child.rels.father = member.id;
                console.log(`Fixed: Set ${member.id} as father of ${child.id}`);
              }
            } else if (
              member.data.gender === "female" ||
              member.data.gender === "f"
            ) {
              if (!child.rels.mother) {
                child.rels.mother = member.id;
                console.log(`Fixed: Set ${member.id} as mother of ${child.id}`);
              }
            }
          }
        });
      }
    });

    // Second pass: Ensure all parents have children in their children array
    fixedData.forEach((member) => {
      // Check father relationship
      if (member.rels.father) {
        const father = fixedData.find((d) => d.id === member.rels.father);
        if (father) {
          if (!father.rels.children) {
            father.rels.children = [];
          }
          if (!father.rels.children.includes(member.id)) {
            father.rels.children.push(member.id);
            console.log(`Fixed: Added ${member.id} to ${father.id}'s children`);
          }
        }
      }

      // Check mother relationship
      if (member.rels.mother) {
        const mother = fixedData.find((d) => d.id === member.rels.mother);
        if (mother) {
          if (!mother.rels.children) {
            mother.rels.children = [];
          }
          if (!mother.rels.children.includes(member.id)) {
            mother.rels.children.push(member.id);
            console.log(`Fixed: Added ${member.id} to ${mother.id}'s children`);
          }
        }
      }
    });

    // Special fix for LAKETU-EGUNDEBI relationship
    const laketu = fixedData.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
    );
    const egundebi = fixedData.find(
      (d) =>
        d.id === "EGUNDEBI" || d.data.first_name?.toUpperCase() === "EGUNDEBI"
    );

    if (laketu && egundebi) {
      // Ensure Egundebi has Laketu as father
      if (!egundebi.rels.father) {
        egundebi.rels.father = laketu.id;
        console.log(
          `SPECIAL FIX: Set ${laketu.id} as father of ${egundebi.id}`
        );
      }

      // Ensure Laketu has Egundebi as child
      if (!laketu.rels.children) {
        laketu.rels.children = [];
      }
      if (!laketu.rels.children.includes(egundebi.id)) {
        laketu.rels.children.push(egundebi.id);
        console.log(
          `SPECIAL FIX: Added ${egundebi.id} to ${laketu.id}'s children`
        );
      }
    }

    // Third pass: Remove any undefined children arrays
    fixedData.forEach((member) => {
      if (member.rels.children && member.rels.children.length === 0) {
        member.rels.children = undefined;
      }
      if (member.rels.spouses && member.rels.spouses.length === 0) {
        member.rels.spouses = undefined;
      }
    });

    // Final validation log
    const finalLaketu = fixedData.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
    );
    const finalEgundebi = fixedData.find(
      (d) =>
        d.id === "EGUNDEBI" || d.data.first_name?.toUpperCase() === "EGUNDEBI"
    );

    console.log("=== FINAL FIXED RELATIONSHIPS ===");
    console.log("LAKETU final children:", finalLaketu?.rels.children || []);
    console.log("EGUNDEBI final father:", finalEgundebi?.rels.father || "NONE");
    console.log(
      "Connection established:",
      finalEgundebi?.rels.father === finalLaketu?.id &&
        finalLaketu?.rels.children?.includes(finalEgundebi?.id || "")
    );

    return fixedData;
  };

  const wrap = (
    text: d3.Selection<SVGTextElement, unknown, null, undefined>,
    width: number
  ) => {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word: string | undefined;
      let line: string[] = [];
      let lineNumber = 0;
      const lineHeight = 1.2; // ems
      const x = text.attr("x");
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy") || "0");
      text.text(null);

      let tspan = text
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        const node = tspan.node() as SVGTextContentElement;
        if (node.getComputedTextLength() > width && line.length > 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  };

  // Initialize Family Chart
  const initializeFamilyChart = useCallback(
    async (data: FamilyChartMember[]) => {
      if (!familyTreeRef.current || data.length === 0) return;

      setIsInitializingChart(true);

      // Clear previous chart
      if (familyChartInstance.current) {
        familyTreeRef.current.innerHTML = "";
      }

      // Find the originator (main person)
      const originator = data.find(
        (d) =>
          d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
      );

      if (!originator) {
        console.error("No originator found in data");
        toast.error("No LAKETU originator found in family data");
        return;
      }

      console.log("Found originator:", originator);
      console.log("Total family data nodes:", data.length);

      // Log some sample relationships for debugging
      const membersWithChildren = data.filter(
        (d) => d.rels.children && d.rels.children.length > 0
      );
      const membersWithSpouses = data.filter(
        (d) => d.rels.spouses && d.rels.spouses.length > 0
      );

      console.log("Members with children:", membersWithChildren.length);
      console.log("Members with spouses:", membersWithSpouses.length);
      console.log(
        "Sample members with children:",
        membersWithChildren.slice(0, 5).map((m) => ({
          id: m.id,
          name: `${m.data.first_name} ${m.data.last_name}`,
          children: m.rels.children,
        }))
      );

      try {
        // Load family-chart library dynamically
        const familyChart = await loadFamilyChart();

        // Test if family-chart library is available
        console.log("Family-chart library check:", {
          f3Available: !!familyChart,
          createSvgAvailable: !!familyChart?.createSvg,
          CalculateTreeAvailable: !!familyChart?.CalculateTree,
          viewAvailable: !!familyChart?.view,
        });

        if (
          !familyChart ||
          !familyChart.createSvg ||
          !familyChart.CalculateTree ||
          !familyChart.view
        ) {
          throw new Error(
            "Family-chart library methods are not available. This may be due to network issues or browser compatibility."
          );
        }

        // Create SVG using family-chart's createSvg method
        const svg = familyChart.createSvg(familyTreeRef.current);

        if (!svg) {
          throw new Error("Failed to create SVG element");
        }

        console.log("SVG created successfully:", svg);

        // Calculate tree layout using family-chart
        const tree_data = familyChart.CalculateTree({
          data: data,
          node_separation: 500,
          level_separation: 450,
          main_id: originator.id,
        });

        if (!tree_data || !tree_data.data) {
          throw new Error("Failed to calculate tree data");
        }

        console.log("Tree calculation result:", {
          totalNodes: tree_data.data?.length || 0,
          mainNode: tree_data.data?.[0]?.data || null,
          hasData: !!tree_data.data,
          dataStructure: tree_data.data?.[0] || null,
        });

        // Validate tree data structure
        if (!Array.isArray(tree_data.data) || tree_data.data.length === 0) {
          throw new Error("Tree data is empty or invalid");
        }

        // Custom card function for styling nodes
        const Card = (onClick: (d: any) => void) => {
          return function (this: any, d: any) {
            const member = d.data.data || d.data;
            const isFemale =
              member.gender === "female" || member.gender === "f";
            const lineageColor = member.lineageColor || LINEAGE_COLORS.DEFAULT;
            const placeholderBgColor = "#d1d5db"; // gray-300
            const textColor = "white"; // white text for better contrast

            this.innerHTML = "";

            const width = 140;
            const height = 180;
            const borderRadius = 15;

            const g = d3
              .select(this)
              .append("g")
              .attr("transform", `translate(${-width / 2}, ${-height / 2})`)
              .attr("class", "card")
              .attr("data-id", member.unique_id)
              .attr("cursor", "pointer")
              .on("click", () => onClick.call(this, d));

            // Main card rect for both genders
            g.append("rect")
              .attr("width", width)
              .attr("height", height)
              .attr("rx", borderRadius)
              .attr("ry", borderRadius)
              .attr("fill", lineageColor)
              .attr("stroke", "#4b5563") // gray-600
              .attr("stroke-width", 2);

            // Image placeholder
            if (isFemale) {
              // Circular image placeholder for females
              g.append("circle")
                .attr("cx", width / 2)
                .attr("cy", 60)
                .attr("r", 45)
                .attr("fill", placeholderBgColor);
            } else {
              // Rectangular image placeholder for males
              g.append("rect")
                .attr("x", 20)
                .attr("y", 15)
                .attr("width", width - 40)
                .attr("height", 90)
                .attr("rx", borderRadius - 5)
                .attr("ry", borderRadius - 5)
                .attr("fill", placeholderBgColor);
            }

            // Add name text
            const nameText = `${member.first_name} ${member.last_name}`;

            g.append("text")
              .attr("x", width / 2)
              .attr("y", 130)
              .attr("dy", 0)
              .attr("text-anchor", "middle")
              .attr("fill", textColor)
              .attr("font-size", "14px")
              .attr("font-weight", "bold")
              .text(nameText)
              .call(wrap as any, width - 20);
          };
        };

        // Click handler
        const onCardClick = (d: any) => {
          const member = d.data.data || d.data;
          toast.info(`Clicked on ${member.first_name} ${member.last_name}`, {
            description: `ID: ${member.unique_id}${
              member.birthday
                ? ` | Born: ${new Date(member.birthday).getFullYear()}`
                : ""
            }`,
          });
          console.log("Card clicked:", member);
        };

        // Render the tree using family-chart's view method
        familyChart.view(tree_data, svg, Card(onCardClick));

        // Add zoom functionality to the SVG
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => {
            const container = d3.select(svg).select(".view");
            if (container.node()) {
              container.attr("transform", event.transform);
            }
          });

        d3.select(svg).call(zoom as any);

        // Set initial zoom to fit the tree
        setTimeout(() => {
          try {
            const container = d3.select(svg);
            const viewBox = svg.getBBox();
            const containerWidth = familyTreeRef.current!.offsetWidth;
            const containerHeight = Math.max(600, window.innerHeight - 400);

            if (viewBox.width > 0 && viewBox.height > 0) {
              const scaleX = (containerWidth * 0.8) / viewBox.width;
              const scaleY = (containerHeight * 0.8) / viewBox.height;
              const scale = Math.min(scaleX, scaleY, 1);

              const centerX = containerWidth / 2;
              const centerY = containerHeight / 2;
              const translateX =
                centerX - (viewBox.x + viewBox.width / 2) * scale;
              const translateY =
                centerY - (viewBox.y + viewBox.height / 2) * scale;

              const initialTransform = d3.zoomIdentity
                .translate(translateX, translateY)
                .scale(scale);

              container.call(zoom.transform as any, initialTransform);
            }
          } catch (zoomError) {
            console.warn("Could not set initial zoom:", zoomError);
          }
        }, 500);

        familyChartInstance.current = { svg, tree_data, zoom };

        // Make it responsive
        const handleResize = () => {
          if (familyTreeRef.current) {
            const newWidth = familyTreeRef.current.offsetWidth;
            const newHeight = Math.max(600, window.innerHeight - 400);

            d3.select(svg).attr("width", newWidth).attr("height", newHeight);
          }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("Error initializing family chart:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initialize family tree visualization";
        toast.error("Failed to initialize family tree visualization", {
          description: errorMessage,
        });

        // Fallback: Create a simple tree visualization
        try {
          console.log("Attempting fallback visualization...");
          createFallbackVisualization(data);
        } catch (fallbackError) {
          console.error("Fallback visualization also failed:", fallbackError);

          // Show a simple message with better guidance
          if (familyTreeRef.current) {
            familyTreeRef.current.innerHTML = `
            <div class="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Family Tree Visualization Error</h3>
                <p class="mt-1 text-sm text-gray-500">Unable to render the family tree. Found ${data.length} family members.</p>
                <p class="mt-1 text-xs text-gray-400">This may be due to network issues or browser compatibility. Try switching to table view or refreshing the page.</p>
                <div class="mt-3 space-x-2">
                  <button 
                    onclick="window.location.reload()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Retry
                  </button>
                  <button 
                    onclick="document.querySelector('[data-view-mode=\\"table\\"]')?.click()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Switch to Table
                  </button>
                </div>
              </div>
            </div>
          `;
          }
        }
      } finally {
        setIsInitializingChart(false);
      }
    },
    []
  );

  // Fallback visualization function
  const createFallbackVisualization = (data: FamilyChartMember[]) => {
    if (!familyTreeRef.current) return;

    console.log("Creating fallback visualization with", data.length, "members");

    // Clear container
    familyTreeRef.current.innerHTML = "";

    // Create a simple SVG
    const containerWidth = familyTreeRef.current.offsetWidth;
    const containerHeight = Math.max(600, window.innerHeight - 400);

    const svg = d3
      .select(familyTreeRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("background", "#f8fafc");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create main container group
    const container = svg.append("g").attr("class", "fallback-container");

    // Find the originator
    const originator = data.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
    );

    if (!originator) {
      throw new Error("No LAKETU originator found for fallback visualization");
    }

    // Create a simple hierarchy
    const hierarchy = d3.hierarchy({
      id: originator.id,
      data: originator.data,
      children: getChildrenRecursive(originator.id, data),
    });

    // Create tree layout
    const treeLayout = d3
      .tree<any>()
      .size([containerWidth - 200, containerHeight - 200])
      .separation((a, b) => (a.parent === b.parent ? 3 : 4));

    const treeData = treeLayout(hierarchy);

    // Create links
    container
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return d3
          .linkVertical()
          .x((node: any) => node.x)
          .y((node: any) => node.y)(d);
      })
      .attr("fill", "none")
      .attr("stroke", "#000000")
      .attr("stroke-width", 3);

    // Create nodes
    const nodes = container
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .attr("data-id", (d: any) => {
        const member = d.data.data || d.data;
        return member.unique_id;
      })
      .style("cursor", "pointer");

    // Add circles for nodes - increased size
    nodes
      .append("circle")
      .attr("r", 60)
      .attr(
        "fill",
        (d: any) => d.data.data?.lineageColor || LINEAGE_COLORS.DEFAULT
      )
      .attr("stroke", (d: any) => {
        const member = d.data.data || d.data;
        return member.unique_id === highlightedMemberId ? "#fbbf24" : "#000";
      })
      .attr("stroke-width", (d: any) => {
        const member = d.data.data || d.data;
        return member.unique_id === highlightedMemberId ? 5 : 2;
      });

    // Add text - improved for longer names
    nodes
      .append("text")
      .attr("dy", "-0.5em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .each(function (d: any) {
        const member = d.data.data || d.data;
        const name = `${member.first_name} ${member.last_name}`;
        const selection = d3.select(this);

        if (name.length > 12) {
          // Split long names into two lines
          const nameParts = name.split(" ");
          const firstLine = nameParts[0];
          const secondLine = nameParts.slice(1).join(" ");

          selection
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "0em")
            .text(firstLine);

          selection
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(secondLine);
        } else {
          selection.text(name);
        }
      });

    // Add ID text below the name
    nodes
      .append("text")
      .attr("dy", "1.8em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("opacity", 0.8)
      .text((d: any) => {
        const member = d.data.data || d.data;
        return member.unique_id;
      });

    // Add click handlers
    nodes.on("click", (event, d: any) => {
      const member = d.data.data || d.data;
      toast.info(`Clicked on ${member.first_name} ${member.last_name}`, {
        description: `ID: ${member.unique_id}`,
      });
    });

    // Center the tree
    const bounds = container.node()?.getBBox();
    if (bounds) {
      const translateX = (containerWidth - bounds.width) / 2 - bounds.x;
      const translateY = 50;

      const initialTransform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(0.8);

      svg.call(zoom.transform as any, initialTransform);
    }

    console.log("Fallback visualization created successfully");
  };

  // Helper function to get children recursively
  const getChildrenRecursive = (
    parentId: string,
    allData: FamilyChartMember[],
    depth = 0
  ): any[] => {
    if (depth > 5) return []; // Prevent infinite recursion

    const parent = allData.find((d) => d.id === parentId);
    if (!parent?.rels.children) return [];

    return parent.rels.children
      .map((childId) => {
        const child = allData.find((d) => d.id === childId);
        if (!child) return null;

        return {
          id: child.id,
          data: child.data,
          children: getChildrenRecursive(child.id, allData, depth + 1),
        };
      })
      .filter(Boolean);
  };

  // Update family chart when data changes
  useEffect(() => {
    if (existingData.length > 0) {
      const chartData = convertToFamilyChartFormat(existingData);
      setFamilyChartData(chartData);

      if (viewMode === "tree") {
        // Only try to initialize if family-chart is available or we haven't checked yet
        if (familyChartAvailable !== false) {
          initializeFamilyChart(chartData).catch((error) => {
            console.error("Failed to initialize family chart:", error);
            toast.error("Failed to initialize family tree visualization");
          });
        } else {
          // If family-chart is not available, show fallback immediately
          try {
            createFallbackVisualization(chartData);
          } catch (error) {
            console.error("Fallback visualization failed:", error);
            toast.error("Unable to display family tree visualization");
          }
        }
      }
    }
  }, [
    existingData,
    viewMode,
    familyChartAvailable,
    initializeFamilyChart,
    convertToFamilyChartFormat,
  ]);

  // Search functionality
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        setHighlightedMemberId("");
        return;
      }

      const searchTerm = query.toLowerCase().trim();
      const results = existingData.filter((member) => {
        const matches = [];

        // Search in names
        if (searchFilters.searchInNames) {
          const fullName =
            `${member.first_name} ${member.last_name}`.toLowerCase();
          const firstName = member.first_name?.toLowerCase() || "";
          const lastName = member.last_name?.toLowerCase() || "";
          matches.push(
            fullName.includes(searchTerm) ||
              firstName.includes(searchTerm) ||
              lastName.includes(searchTerm)
          );
        }

        // Search in IDs
        if (searchFilters.searchInIds) {
          const uniqueId = member.unique_id?.toLowerCase() || "";
          matches.push(uniqueId.includes(searchTerm));
        }

        // Search in dates
        if (searchFilters.searchInDates) {
          const dateOfBirth = member.date_of_birth?.toLowerCase() || "";
          matches.push(dateOfBirth.includes(searchTerm));
        }

        // Search in relations
        if (searchFilters.searchInRelations) {
          const fatherName =
            `${member.fathers_first_name} ${member.fathers_last_name}`.toLowerCase();
          const motherName =
            `${member.mothers_first_name} ${member.mothers_last_name}`.toLowerCase();
          const spouseName =
            `${member.spouses_first_name} ${member.spouses_last_name}`.toLowerCase();

          matches.push(
            fatherName.includes(searchTerm) ||
              motherName.includes(searchTerm) ||
              spouseName.includes(searchTerm)
          );
        }

        return matches.some((match) => match);
      });

      setSearchResults(results);
      setShowSearchResults(true);
    },
    [existingData, searchFilters]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      performSearch(query);
    },
    [performSearch]
  );

  // Function to update node highlighting without re-rendering
  const updateNodeHighlighting = useCallback((memberId: string) => {
    if (!familyTreeRef.current) return;

    // Clear previous highlights
    const allCards = familyTreeRef.current.querySelectorAll(
      '.card [stroke="#fbbf24"]'
    );
    allCards.forEach((element) => {
      const shape = element as SVGElement;
      shape.setAttribute("stroke", "#000");
      shape.setAttribute(
        "stroke-width",
        shape
          .closest("[data-id]")
          ?.querySelector("rect, circle")
          ?.getAttribute("stroke-width") || "1"
      );
    });

    // Apply new highlight
    if (memberId) {
      const targetCard = familyTreeRef.current.querySelector(
        `[data-id="${memberId}"]`
      );
      if (targetCard) {
        const shape = targetCard.querySelector("rect, circle") as SVGElement;
        if (shape) {
          shape.setAttribute("stroke", "#fbbf24");
          shape.setAttribute("stroke-width", "5");
        }
      }
    }
  }, []);

  const highlightMemberInTree = useCallback(
    (memberId: string) => {
      setHighlightedMemberId(memberId);

      // Update highlighting without re-rendering
      updateNodeHighlighting(memberId);

      // If in tree view, try to focus on the highlighted member
      if (viewMode === "tree" && familyTreeRef.current) {
        try {
          // First, find the member card in the DOM
          const memberCard = familyTreeRef.current.querySelector(
            `[data-id="${memberId}"]`
          );

          if (memberCard) {
            console.log("Found member card for", memberId);

            // Check if we're using the main family chart or fallback
            if (
              familyChartInstance.current &&
              familyChartInstance.current.svg &&
              familyChartInstance.current.zoom
            ) {
              // Main family chart logic - get coordinates from tree data
              const { svg, zoom, tree_data } = familyChartInstance.current;

              console.log(
                "Family chart instance:",
                familyChartInstance.current
              );
              console.log("Tree data structure:", tree_data);

              if (tree_data && tree_data.data) {
                console.log("Tree data nodes:", tree_data.data);
                console.log("Looking for member ID:", memberId);

                // Find the node in the tree data
                const targetNode = tree_data.data.find((node: any) => {
                  const nodeData = node.data?.data || node.data;
                  console.log("Checking node:", nodeData, "against", memberId);
                  return (
                    nodeData?.unique_id === memberId ||
                    nodeData?.id === memberId
                  );
                });

                console.log("Found target node:", targetNode);

                if (
                  targetNode &&
                  targetNode.x !== undefined &&
                  targetNode.y !== undefined
                ) {
                  console.log("Found target node with coordinates:", {
                    x: targetNode.x,
                    y: targetNode.y,
                  });

                  // Get container dimensions
                  const containerRect =
                    familyTreeRef.current.getBoundingClientRect();
                  const centerX = containerRect.width / 2;
                  const centerY = containerRect.height / 2;

                  // Calculate the zoom transform to center this node
                  const scale = 1.2; // Zoom in a bit to focus on the member
                  const translateX = centerX - targetNode.x * scale;
                  const translateY = centerY - targetNode.y * scale;

                  console.log("Zoom transform:", {
                    scale,
                    translateX,
                    translateY,
                    nodeX: targetNode.x,
                    nodeY: targetNode.y,
                    centerX,
                    centerY,
                  });

                  // Apply the zoom transform
                  const zoomTransform = d3.zoomIdentity
                    .translate(translateX, translateY)
                    .scale(scale);

                  // Use D3 to smoothly transition to the new zoom level
                  d3.select(svg)
                    .transition()
                    .duration(1000)
                    .call(zoom.transform, zoomTransform);

                  // Add additional visual highlight effect after zoom
                  setTimeout(() => {
                    const cardElement = memberCard as HTMLElement;
                    const originalFilter = cardElement.style.filter;
                    cardElement.style.filter = "drop-shadow(0 0 15px #fbbf24)";
                    cardElement.style.transition = "filter 0.3s ease";

                    setTimeout(() => {
                      cardElement.style.filter = originalFilter;
                    }, 3000);
                  }, 1000);

                  toast.success("Located family member", {
                    description: `Found ${
                      searchResults.find((m) => m.unique_id === memberId)
                        ?.first_name || memberId
                    } in the tree`,
                  });
                } else {
                  console.log("Node found but no coordinates:", targetNode);
                  console.log(
                    "All nodes with coordinates:",
                    tree_data.data.map((n: any) => ({
                      id: n.data?.data?.unique_id || n.data?.id,
                      x: n.x,
                      y: n.y,
                    }))
                  );
                  // Fallback: just scroll to the element
                  memberCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  toast.success("Located family member");
                }
              } else {
                console.log("No tree data available");
                // Fallback: just scroll to the element
                memberCard.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                toast.success("Located family member");
              }
            } else {
              // Fallback visualization logic
              const svg = familyTreeRef.current.querySelector("svg");
              if (svg) {
                // For fallback, try to get the node group's position
                const nodeGroup = memberCard.closest("g");
                const transform = nodeGroup?.getAttribute("transform");

                if (transform) {
                  const translateMatch = transform.match(
                    /translate\(([^,]+),([^)]+)\)/
                  );
                  if (translateMatch) {
                    const x = parseFloat(translateMatch[1]);
                    const y = parseFloat(translateMatch[2]);

                    console.log("Fallback node position:", { x, y });

                    // Get container dimensions
                    const containerRect =
                      familyTreeRef.current.getBoundingClientRect();
                    const centerX = containerRect.width / 2;
                    const centerY = containerRect.height / 2;

                    // Calculate zoom transform
                    const scale = 1.5;
                    const translateX = centerX - x * scale;
                    const translateY = centerY - y * scale;

                    const zoomTransform = d3.zoomIdentity
                      .translate(translateX, translateY)
                      .scale(scale);

                    // Try to get zoom behavior from SVG
                    const svgSelection = d3.select(svg);
                    try {
                      // Apply zoom transform
                      svgSelection
                        .transition()
                        .duration(1000)
                        .call(d3.zoom().transform as any, zoomTransform);
                    } catch (zoomError) {
                      // Manual zoom fallback
                      const container = svg.querySelector(
                        ".fallback-container, g"
                      );
                      if (container) {
                        d3.select(container)
                          .transition()
                          .duration(1000)
                          .attr(
                            "transform",
                            `translate(${translateX},${translateY}) scale(${scale})`
                          );
                      }
                    }

                    toast.success("Located family member", {
                      description: `Found ${
                        searchResults.find((m) => m.unique_id === memberId)
                          ?.first_name || memberId
                      } in the tree`,
                    });
                  } else {
                    // Simple fallback
                    memberCard.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    toast.success("Located family member");
                  }
                }
              }
            }
          } else {
            console.log("Member card not found for", memberId);

            // Alternative approach: search in the family chart data
            const member = familyChartData.find((m) => m.id === memberId);
            if (member) {
              console.log("Found member in data:", member);
              toast.info("Member found in data", {
                description: `${member.data.first_name} ${member.data.last_name} - but not visible in current tree view`,
              });
            } else {
              toast.error("Member not found", {
                description: `Could not locate ${memberId} in the family tree`,
              });
            }
          }
        } catch (error) {
          console.error("Error locating member:", error);
          toast.error("Error locating member", {
            description: "Please try refreshing the tree view",
          });
        }
      } else if (viewMode === "table") {
        // For table view, just highlight the row
        toast.success("Member highlighted in table");
      }

      // Auto-close search results after selection
      setTimeout(() => {
        setShowSearchResults(false);
        setSearchQuery("");
      }, 1500);
    },
    [viewMode, familyChartData, searchResults, updateNodeHighlighting]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setHighlightedMemberId("");
  }, []);

  // Re-trigger search when filters change
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchFilters, searchQuery, performSearch]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Tree Data Upload</h1>
          <p className="text-muted-foreground">
            Upload Excel or CSV files to populate the family tree database
          </p>
        </div>
        {/* <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button> */}
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search Family Tree
          </CardTitle>
          <CardDescription>
            Search for family members by name, ID, dates, or relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search family members..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="searchNames"
                  checked={searchFilters.searchInNames}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      searchInNames: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="searchNames" className="text-sm">
                  Names
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="searchIds"
                  checked={searchFilters.searchInIds}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      searchInIds: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="searchIds" className="text-sm">
                  IDs
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="searchDates"
                  checked={searchFilters.searchInDates}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      searchInDates: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="searchDates" className="text-sm">
                  Dates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="searchRelations"
                  checked={searchFilters.searchInRelations}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      searchInRelations: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="searchRelations" className="text-sm">
                  Relations
                </Label>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Found {searchResults.length} member
                      {searchResults.length !== 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((member, index) => (
                    <div
                      key={member.id || index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => highlightMemberInTree(member.unique_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {member.gender?.toLowerCase() === "male" ||
                          member.gender?.toLowerCase() === "m" ? (
                            <User className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Users className="h-5 w-5 text-pink-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.first_name} {member.last_name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {member.unique_id}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {member.date_of_birth && (
                              <span className="text-xs text-gray-500">
                                Born:{" "}
                                {new Date(member.date_of_birth).getFullYear()}
                              </span>
                            )}
                            {member.fathers_first_name && (
                              <span className="text-xs text-gray-500">
                                Father: {member.fathers_first_name}{" "}
                                {member.fathers_last_name}
                              </span>
                            )}
                            {member.mothers_first_name && (
                              <span className="text-xs text-gray-500">
                                Mother: {member.mothers_first_name}{" "}
                                {member.mothers_last_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              highlightMemberInTree(member.unique_id);
                            }}
                          >
                            {viewMode === "tree" ? "Locate" : "Select"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-6 text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No family members found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoadingData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Current family members in the database - Interactive family tree
              with click actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">
                          Unique ID
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Last Name
                        </TableHead>
                        <TableHead className="min-w-[80px]">Gender</TableHead>
                        <TableHead className="min-w-[120px]">
                          Date of Birth
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Father&apos;s First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Father&apos;s Last Name
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Father&apos;s UID
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Mother&apos;s First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Mother&apos;s Last Name
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Mother&apos;s UID
                        </TableHead>
                        <TableHead className="min-w-[100px]">
                          Order of Birth (Motherline)
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Order of Marriage
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Marital Status
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Spouse&apos;s First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Spouse&apos;s Last Name
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Spouse UID
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Life Status
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                          Email Address
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                          Picture Link
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(searchQuery && searchResults.length > 0
                        ? searchResults
                        : existingData
                      ).map((member, index) => (
                        <TableRow
                          key={member.id || index}
                          className={`${
                            highlightedMemberId === member.unique_id
                              ? "bg-yellow-100 border-l-4 border-l-yellow-500"
                              : searchQuery &&
                                searchResults.some(
                                  (r) => r.unique_id === member.unique_id
                                )
                              ? "bg-blue-50"
                              : ""
                          } cursor-pointer hover:bg-gray-50`}
                          onClick={() =>
                            highlightMemberInTree(member.unique_id)
                          }
                        >
                          <TableCell className="font-medium">
                            {member.unique_id}
                          </TableCell>
                          <TableCell>{member.first_name}</TableCell>
                          <TableCell>{member.last_name}</TableCell>
                          <TableCell>{member.gender}</TableCell>
                          <TableCell>
                            {member.date_of_birth
                              ? new Date(
                                  member.date_of_birth
                                ).toLocaleDateString()
                              : ""}
                          </TableCell>
                          <TableCell>{member.fathers_first_name}</TableCell>
                          <TableCell>{member.fathers_last_name}</TableCell>
                          <TableCell>{member.fathers_uid || ""}</TableCell>
                          <TableCell>{member.mothers_first_name}</TableCell>
                          <TableCell>{member.mothers_last_name}</TableCell>
                          <TableCell>{member.mothers_uid || ""}</TableCell>
                          <TableCell>{member.order_of_birth}</TableCell>
                          <TableCell>{member.order_of_marriage}</TableCell>
                          <TableCell>{member.marital_status}</TableCell>
                          <TableCell>{member.spouses_first_name}</TableCell>
                          <TableCell>{member.spouses_last_name}</TableCell>
                          <TableCell>{member.spouse_uid || ""}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.life_status === "Alive"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.life_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.email_address && (
                              <div className="space-y-1">
                                <div className="text-blue-600 hover:text-blue-800 truncate">
                                  {member.email_address}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {/* Add account status indicator if needed */}
                                  Account Status: Active
                                </div>
                              </div>
                            )}
                          </TableCell>
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
                {/* Update footer message to reflect search results */}
                <div className="p-4 text-center text-muted-foreground border-t">
                  {searchQuery && searchResults.length > 0
                    ? `Showing ${searchResults.length} search results`
                    : `Showing ${existingData.length} family members`}
                  {searchQuery && searchResults.length === 0 && (
                    <span className="text-orange-600"> - No matches found</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg">
                {familyChartData.length > 0 ? (
                  <div>
                    {/* Legend */}
                    <div className="p-4 border-b bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Lineage Colors:
                          </h4>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.LAKETU,
                                }}
                              ></div>
                              <span>LAKETU (Originator)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.EGUNDEBI,
                                }}
                              ></div>
                              <span>EGUNDEBI (is Red)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor:
                                    LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_1,
                                }}
                              ></div>
                              <span>Egundebi Male Child 1 (Green)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor:
                                    LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_2,
                                }}
                              ></div>
                              <span>Egundebi Male Child 2 (Blue)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor:
                                    LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_3,
                                }}
                              ></div>
                              <span>Egundebi Male Child 3 (Purple)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor:
                                    LINEAGE_COLORS.EGUNDEBI_FEMALE_CHILD,
                                }}
                              ></div>
                              <span>Egundebi Female Child (Yellow)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">
                            Interactive Features:
                          </h4>
                          <ul className="text-xs space-y-1">
                            <li>• Click on any family member to see details</li>
                            <li>• Zoom in/out using mouse wheel or pinch</li>
                            <li>• Pan by dragging the background</li>
                            <li>
                              • Males: Square shapes, Females: Circular shapes
                            </li>
                            <li>• Tree auto-zooms to fit on initial load</li>
                            <li>• Responsive design adapts to screen size</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Family Chart Container */}
                    <FamilyTreeErrorBoundary>
                      <div
                        ref={familyTreeRef}
                        className="w-full min-h-[600px] bg-white overflow-hidden relative"
                        style={{ height: "calc(100vh - 400px)" }}
                      >
                        {familyChartAvailable === false && (
                          <div className="absolute top-4 left-4 right-4 z-20">
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Family tree visualization library is not
                                available. The tree view may not work properly.
                                Consider using the table view instead.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                        {isInitializingChart && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <div className="text-center">
                              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                              <p className="text-sm text-gray-600">
                                Initializing family tree visualization...
                              </p>
                            </div>
                          </div>
                        )}
                        {/* CSS Styles for family-chart connections */}
                        <style
                          dangerouslySetInnerHTML={{
                            __html: `
                              .links_view path.link {
                                stroke: #000000 !important;
                                stroke-width: 3px !important;
                              }
                              .link {
                                stroke: #000000 !important;
                                stroke-width: 3px !important;
                              }
                              /* Ensure fallback visualization links are also black */
                              .fallback-container .link {
                                stroke: #000000 !important;
                                stroke-width: 3px !important;
                              }
                            `,
                          }}
                        />
                      </div>
                    </FamilyTreeErrorBoundary>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Family Tree Data
                    </h3>
                    <p className="text-gray-500">
                      Upload family data with LAKETU as the originator to build
                      the interactive tree.
                    </p>
                  </div>
                )}
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
          <Alert>
            <AlertDescription>
              Records with a Unique ID that already exists in the database will
              be
              <span className="font-semibold"> skipped</span> during upload.
              Only new, non-duplicate records will be inserted.
            </AlertDescription>
          </Alert>
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
                      <TableHead>Father UID</TableHead>
                      <TableHead>Mother</TableHead>
                      <TableHead>Mother UID</TableHead>
                      <TableHead>Spouse</TableHead>
                      <TableHead>Spouse UID</TableHead>
                      <TableHead>Life Status</TableHead>
                      <TableHead>Email Address</TableHead>
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
                        <TableCell>{member["Fathers' UID"] || ""}</TableCell>
                        <TableCell>
                          {member["Mothers' First Name"]}{" "}
                          {member["Mothers' Last Name"]}
                        </TableCell>
                        <TableCell>{member["Mothers' UID"] || ""}</TableCell>
                        <TableCell>
                          {member["Spouses' First Name"]}{" "}
                          {member["Spouses' Last Name"]}
                        </TableCell>
                        <TableCell>{member["Spouse UID"] || ""}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member["Life Status"]?.toLowerCase() === "alive"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member["Life Status"] || "Alive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member["Email Address"] && (
                            <span className="text-blue-600">
                              {member["Email Address"]}
                            </span>
                          )}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResults.success}
                </div>
                <div className="text-sm text-muted-foreground">
                  Family Members Uploaded
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResults.failed}
                </div>
                <div className="text-sm text-muted-foreground">
                  Upload Failed
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {uploadResults.skippedExisting || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Skipped (Already Exists)
                </div>
              </div>
            </div>

            {/* Account Creation Results */}
            {uploadResults.accountResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  Account Creation Results
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResults.accountResults.success}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accounts Created
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {uploadResults.accountResults.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResults.accountResults.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Account Creation Failed
                    </div>
                  </div>
                </div>

                {/* Account Creation Details */}
                {uploadResults.accountResults.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Account Creation Details:</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Family Member ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uploadResults.accountResults.results.map(
                              (result, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {result.familyMemberId}
                                  </TableCell>
                                  <TableCell>
                                    {result.firstName} {result.lastName}
                                  </TableCell>
                                  <TableCell>
                                    {result.email || "No email"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        result.status === "created"
                                          ? "default"
                                          : result.status === "failed"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                    >
                                      {result.status === "created"
                                        ? "Account Created"
                                        : result.status === "failed"
                                        ? "Failed"
                                        : result.status === "skipped_deceased"
                                        ? "Skipped (Deceased)"
                                        : result.status ===
                                          "skipped_invalid_email"
                                        ? "Skipped (Invalid Email)"
                                        : result.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {result.status === "created" &&
                                      result.password && (
                                        <div className="space-y-1">
                                          <div>User ID: {result.userId}</div>
                                          <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                                            Password: {result.password}
                                          </div>
                                        </div>
                                      )}
                                    {result.status === "failed" &&
                                      result.error && (
                                        <span className="text-red-600">
                                          {result.error}
                                        </span>
                                      )}
                                    {result.status === "skipped_deceased" && (
                                      <span className="text-gray-600">
                                        Member is deceased
                                      </span>
                                    )}
                                    {result.status ===
                                      "skipped_invalid_email" && (
                                      <span className="text-yellow-600">
                                        Invalid email format
                                      </span>
                                    )}
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
              </div>
            )}

            {uploadResults.skippedExisting &&
              uploadResults.skippedExisting > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Skipped Existing Unique IDs:</h4>
                  <div className="text-xs text-muted-foreground break-words">
                    {(uploadResults.skippedExistingIds || []).join(", ")}
                  </div>
                </div>
              )}

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

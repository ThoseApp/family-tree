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
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// Import family-chart library
// @ts-ignore - family-chart doesn't have type definitions
import f3 from "family-chart";

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

// Color scheme for the 4 main lineages
const LINEAGE_COLORS = {
  LAKETU: "#8B4513", // Brown for originator
  EGUNDEBI: "#2563EB", // Blue for first Mosuro
  ADELAJA: "#DC2626", // Red for first child
  CHILD2: "#059669", // Green for second child
  CHILD3: "#7C3AED", // Purple for third child
  CHILD4: "#EA580C", // Orange for fourth child
  DEFAULT: "#6B7280", // Gray for others
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
  } | null>(null);
  const [existingData, setExistingData] = useState<ProcessedMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [familyChartData, setFamilyChartData] = useState<FamilyChartMember[]>(
    []
  );

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

    data.forEach((row, index) => {
      if (!row["Unique ID"]) {
        errors.push({
          row: index + 1,
          field: "Unique ID",
          message: "Unique ID is required",
        });
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
    const templateHeader = requiredColumns.join(",");
    const sampleData = [
      '"https://example.com/laketu.jpg","LAKETU","Male","LAKETU","MOSURO","","","","","0","0","Single","","","1850-01-01"',
      '"https://example.com/egundebi.jpg","EGUNDEBI","Male","EGUNDEBI","MOSURO","LAKETU","MOSURO","","","1","1","Married","ABIKE","ADEBAYO","1875-03-15"',
      '"https://example.com/abike.jpg","S001","Female","ABIKE","ADEBAYO","","","","","0","0","Married","EGUNDEBI","MOSURO","1878-06-20"',
      '"https://example.com/adelaja.jpg","D001","Male","ADELAJA","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","1","1","Married","FOLAKE","OGUNDIMU","1900-01-10"',
      '"https://example.com/adunni.jpg","D002","Female","ADUNNI","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","2","0","Married","BABATUNDE","OGUNDIMU","1902-05-18"',
      '"https://example.com/adebayo.jpg","D003","Male","ADEBAYO","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","3","1","Married","KEMI","ADEYEMI","1904-08-25"',
      '"https://example.com/aduke.jpg","D004","Female","ADUKE","MOSURO","EGUNDEBI","MOSURO","ABIKE","ADEBAYO","4","0","Married","TAIWO","ADEYEMI","1906-12-30"',
      '"https://example.com/folake.jpg","S002","Female","FOLAKE","OGUNDIMU","","","","","0","0","Married","ADELAJA","MOSURO","1903-02-14"',
      '"https://example.com/babatunde.jpg","S003","Male","BABATUNDE","OGUNDIMU","","","","","0","0","Married","ADUNNI","MOSURO","1899-09-12"',
      '"https://example.com/kemi.jpg","S004","Female","KEMI","ADEYEMI","","","","","0","0","Married","ADEBAYO","MOSURO","1907-04-03"',
      '"https://example.com/taiwo.jpg","S005","Male","TAIWO","ADEYEMI","","","","","0","0","Married","ADUKE","MOSURO","1905-11-22"',
      '"https://example.com/adeola.jpg","D005","Male","ADEOLA","MOSURO","ADELAJA","MOSURO","FOLAKE","OGUNDIMU","1","1","Single","","","1925-07-08"',
      '"https://example.com/adebisi.jpg","D006","Female","ADEBISI","MOSURO","ADELAJA","MOSURO","FOLAKE","OGUNDIMU","2","0","Single","","","1927-11-15"',
      '"https://example.com/kehinde.jpg","D007","Male","KEHINDE","OGUNDIMU","BABATUNDE","OGUNDIMU","ADUNNI","MOSURO","1","1","Single","","","1930-03-20"',
      '"https://example.com/taiye.jpg","D008","Male","TAIYE","OGUNDIMU","BABATUNDE","OGUNDIMU","ADUNNI","MOSURO","1","1","Single","","","1930-03-20"',
      '"https://example.com/adebayo_child1.jpg","D009","Male","ADEBAYO_JR","MOSURO","ADEBAYO","MOSURO","KEMI","ADEYEMI","1","1","Single","","","1932-01-12"',
      '"https://example.com/second_wife.jpg","S006","Female","FUNMI","ADEYEMI","","","","","0","2","Married","ADEBAYO","MOSURO","1910-08-17"',
      '"https://example.com/adebayo_child2.jpg","D010","Female","FUNMILAYO","MOSURO","ADEBAYO","MOSURO","FUNMI","ADEYEMI","1","0","Single","","","1935-06-05"',
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

  // Business Rules Logic (kept from original implementation)
  const findParentLineage = (
    member: ProcessedMember,
    allMembers: ProcessedMember[]
  ): string => {
    const father = allMembers.find(
      (m) =>
        m.first_name === member.fathers_first_name &&
        m.last_name === member.fathers_last_name
    );

    if (father) {
      if (
        father.unique_id === "LAKETU" ||
        father.first_name?.toUpperCase() === "LAKETU"
      ) {
        return LINEAGE_COLORS.LAKETU;
      } else if (
        father.unique_id === "EGUNDEBI" ||
        father.first_name?.toUpperCase() === "EGUNDEBI"
      ) {
        return LINEAGE_COLORS.EGUNDEBI;
      } else if (father.first_name?.toUpperCase() === "ADELAJA") {
        return LINEAGE_COLORS.ADELAJA;
      }

      const fatherParent = allMembers.find(
        (m) =>
          m.first_name === father.fathers_first_name &&
          m.last_name === father.fathers_last_name &&
          (m.unique_id === "EGUNDEBI" ||
            m.first_name?.toUpperCase() === "EGUNDEBI")
      );

      if (fatherParent) {
        const birthOrder = father.order_of_birth || 0;
        switch (birthOrder) {
          case 1:
            return father.first_name?.toUpperCase() === "ADELAJA"
              ? LINEAGE_COLORS.ADELAJA
              : LINEAGE_COLORS.CHILD2;
          case 2:
            return LINEAGE_COLORS.CHILD2;
          case 3:
            return LINEAGE_COLORS.CHILD3;
          case 4:
            return LINEAGE_COLORS.CHILD4;
          default:
            if (father.first_name?.toUpperCase() === "ADELAJA")
              return LINEAGE_COLORS.ADELAJA;
            return LINEAGE_COLORS.CHILD2;
        }
      }
    }

    return LINEAGE_COLORS.DEFAULT;
  };

  const applyBusinessRules = (
    member: ProcessedMember,
    allMembers: ProcessedMember[]
  ) => {
    const uid = member.unique_id;

    const isDescendant = uid?.charAt(0).toUpperCase() === "D";
    const isSpouse = uid?.charAt(0).toUpperCase() === "S";
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

    let lineageColor = LINEAGE_COLORS.DEFAULT;

    if (isOriginator) {
      lineageColor = LINEAGE_COLORS.LAKETU;
    } else if (
      uid === "EGUNDEBI" ||
      member.first_name?.toUpperCase() === "EGUNDEBI"
    ) {
      lineageColor = LINEAGE_COLORS.EGUNDEBI;
    } else if (member.first_name?.toUpperCase() === "ADELAJA") {
      lineageColor = LINEAGE_COLORS.ADELAJA;
    } else {
      const isEgundebisChild =
        member.fathers_first_name?.toUpperCase() === "EGUNDEBI" ||
        member.mothers_first_name?.toUpperCase() === "EGUNDEBI";

      if (isEgundebisChild) {
        const birthOrder = member.order_of_birth || 0;
        switch (birthOrder) {
          case 1:
            lineageColor =
              member.first_name?.toUpperCase() === "ADELAJA"
                ? LINEAGE_COLORS.ADELAJA
                : LINEAGE_COLORS.CHILD2;
            break;
          case 2:
            lineageColor = LINEAGE_COLORS.CHILD2;
            break;
          case 3:
            lineageColor = LINEAGE_COLORS.CHILD3;
            break;
          case 4:
            lineageColor = LINEAGE_COLORS.CHILD4;
            break;
          default:
            if (member.first_name?.toUpperCase() === "ADELAJA") {
              lineageColor = LINEAGE_COLORS.ADELAJA;
            } else {
              lineageColor = LINEAGE_COLORS.CHILD2;
            }
        }
      } else {
        const parentLineage = findParentLineage(member, allMembers);
        lineageColor = parentLineage || LINEAGE_COLORS.DEFAULT;
      }
    }

    return {
      isOriginator,
      isDescendant: isDescendant || (!isSpouse && !isSpouseByRules),
      isSpouse: isSpouse || isSpouseByRules,
      isTwin,
      isPolygamous,
      isOutOfWedlock,
      lineageColor,
    };
  };

  // Convert ProcessedMember data to FamilyChart format
  const convertToFamilyChartFormat = (
    members: ProcessedMember[]
  ): FamilyChartMember[] => {
    console.log("Converting family data - total members:", members.length);
    console.log("Sample member data:", members.slice(0, 2));

    // Create a lookup map for faster searching
    const memberMap = new Map<string, ProcessedMember>();
    const nameMap = new Map<string, ProcessedMember>();

    members.forEach((member) => {
      memberMap.set(member.unique_id, member);
      // Create name-based lookup for finding parents/spouses
      const nameKey = `${member.first_name?.toLowerCase()}_${member.last_name?.toLowerCase()}`;
      nameMap.set(nameKey, member);
    });

    const chartMembers = members.map((member) => {
      const rules = applyBusinessRules(member, members);

      // Find father - try multiple matching strategies
      let father: ProcessedMember | undefined;
      if (member.fathers_first_name && member.fathers_last_name) {
        // First try exact name match
        const fatherKey = `${member.fathers_first_name.toLowerCase()}_${member.fathers_last_name.toLowerCase()}`;
        father = nameMap.get(fatherKey);

        // If not found, try manual search with trim and case insensitive
        if (!father) {
          father = members.find(
            (m) =>
              m.first_name?.toLowerCase().trim() ===
                member.fathers_first_name?.toLowerCase().trim() &&
              m.last_name?.toLowerCase().trim() ===
                member.fathers_last_name?.toLowerCase().trim()
          );
        }
      }

      // Find mother - try multiple matching strategies
      let mother: ProcessedMember | undefined;
      if (member.mothers_first_name && member.mothers_last_name) {
        // First try exact name match
        const motherKey = `${member.mothers_first_name.toLowerCase()}_${member.mothers_last_name.toLowerCase()}`;
        mother = nameMap.get(motherKey);

        // If not found, try manual search with trim and case insensitive
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

      // Find spouses - try multiple matching strategies
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

      // Also find people who list this person as their spouse
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

      // Find children - people who have this person as father or mother
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

          return isFatherMatch || isMotherMatch;
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

      // Log relationship details for debugging
      if (
        member.unique_id === "LAKETU" ||
        children.length > 0 ||
        spouses.length > 0
      ) {
        console.log(
          `Member ${member.unique_id} (${member.first_name} ${member.last_name}):`,
          {
            father: father?.unique_id,
            mother: mother?.unique_id,
            spouses: spouses,
            children: children,
            childrenCount: children.length,
          }
        );
      }

      return chartMember;
    });

    console.log("Converted chart data:", {
      totalMembers: chartMembers.length,
      sampleMember: chartMembers[0],
      laketu: chartMembers.find((m) => m.id === "LAKETU"),
    });

    return chartMembers;
  };

  // Initialize Family Chart
  const initializeFamilyChart = useCallback((data: FamilyChartMember[]) => {
    if (!familyTreeRef.current || data.length === 0) return;

    // Clear previous chart
    if (familyChartInstance.current) {
      familyTreeRef.current.innerHTML = "";
    }

    // Find the originator (main person)
    const originator = data.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
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
      // Test if family-chart library is available
      console.log("Family-chart library check:", {
        f3Available: !!f3,
        createSvgAvailable: !!f3?.createSvg,
        CalculateTreeAvailable: !!f3?.CalculateTree,
        viewAvailable: !!f3?.view,
      });

      if (!f3 || !f3.createSvg || !f3.CalculateTree || !f3.view) {
        throw new Error("Family-chart library methods are not available");
      }

      // Create SVG using family-chart's createSvg method
      const svg = f3.createSvg(familyTreeRef.current);

      if (!svg) {
        throw new Error("Failed to create SVG element");
      }

      console.log("SVG created successfully:", svg);

      // Calculate tree layout using family-chart
      const tree_data = f3.CalculateTree({
        data: data,
        node_separation: 250,
        level_separation: 150,
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
          const isCircular =
            member.gender === "female" || member.gender === "f";
          const backgroundColor = member.lineageColor || LINEAGE_COLORS.DEFAULT;

          // Clear previous content
          this.innerHTML = "";

          // Create card group
          const g = d3
            .select(this)
            .append("g")
            .attr("transform", `translate(${[-70, isCircular ? -70 : -50]})`)
            .attr("class", "card")
            .attr("data-id", d.data.id)
            .attr("cursor", "pointer")
            .on("click", () => onClick.call(this, d));

          // Create shape (rectangle for males, circle for females)
          if (isCircular) {
            g.append("circle")
              .attr("cx", 70)
              .attr("cy", 70)
              .attr("r", 70)
              .attr("fill", backgroundColor)
              .attr("stroke", "#000")
              .attr("stroke-width", member.isOriginator ? 3 : 1);
          } else {
            g.append("rect")
              .attr("width", 140)
              .attr("height", 100)
              .attr("rx", 8)
              .attr("ry", 8)
              .attr("fill", backgroundColor)
              .attr("stroke", "#000")
              .attr("stroke-width", member.isOriginator ? 3 : 1);
          }

          // Add name text
          g.append("text")
            .attr("x", 70)
            .attr("y", isCircular ? 60 : 45)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(`${member.first_name} ${member.last_name}`);

          // Add ID text
          g.append("text")
            .attr("x", 70)
            .attr("y", isCircular ? 80 : 65)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .attr("opacity", 0.8)
            .text(member.unique_id);

          // Add birth year if available
          if (member.birthday) {
            g.append("text")
              .attr("x", 70)
              .attr("y", isCircular ? 95 : 80)
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-size", "9px")
              .attr("opacity", 0.7)
              .text(new Date(member.birthday).getFullYear());
          }

          // Add badges for special attributes
          let badgeX = isCircular ? 120 : 120;
          let badgeY = 10;

          if (member.isOriginator) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 6)
              .attr("fill", "#fbbf24")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
            badgeY += 15;
          }

          if (member.isTwin) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 6)
              .attr("fill", "#60a5fa")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
            badgeY += 15;
          }

          if (member.isPolygamous) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 6)
              .attr("fill", "#f87171")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
          }
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
      f3.view(tree_data, svg, Card(onCardClick));

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
      toast.error("Failed to initialize family tree visualization");

      // Fallback: Create a simple tree visualization
      try {
        console.log("Attempting fallback visualization...");
        createFallbackVisualization(data);
      } catch (fallbackError) {
        console.error("Fallback visualization also failed:", fallbackError);

        // Show a simple message
        if (familyTreeRef.current) {
          familyTreeRef.current.innerHTML = `
            <div class="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Family Tree Visualization Error</h3>
                <p class="mt-1 text-sm text-gray-500">Unable to render the family tree. Found ${data.length} family members.</p>
                <p class="mt-1 text-xs text-gray-400">Check the console for more details or try refreshing the page.</p>
              </div>
            </div>
          `;
        }
      }
    }
  }, []);

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
      .size([containerWidth - 100, containerHeight - 100])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2));

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
      .attr("stroke", "#374151")
      .attr("stroke-width", 2);

    // Create nodes
    const nodes = container
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    // Add circles for nodes
    nodes
      .append("circle")
      .attr("r", 30)
      .attr(
        "fill",
        (d: any) => d.data.data?.lineageColor || LINEAGE_COLORS.DEFAULT
      )
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    // Add text
    nodes
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d: any) => {
        const member = d.data.data || d.data;
        return `${member.first_name} ${member.last_name}`.slice(0, 15);
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
        initializeFamilyChart(chartData);
      }
    }
  }, [existingData, viewMode, initializeFamilyChart]);

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
                <div className="flex rounded-lg border p-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="flex items-center gap-1"
                  >
                    <TableIcon className="h-4 w-4" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === "tree" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("tree")}
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
                          Father's First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Father's Last Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Mother's First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Mother's Last Name
                        </TableHead>
                        <TableHead className="min-w-[100px]">
                          Order of Birth
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Order of Marriage
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Marital Status
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Spouse's First Name
                        </TableHead>
                        <TableHead className="min-w-[150px]">
                          Spouse's Last Name
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                          Picture Link
                        </TableHead>
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
                            {member.date_of_birth
                              ? new Date(
                                  member.date_of_birth
                                ).toLocaleDateString()
                              : ""}
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
                              <span>EGUNDEBI (First Mosuro)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.ADELAJA,
                                }}
                              ></div>
                              <span>ADELAJA Lineage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.CHILD2,
                                }}
                              ></div>
                              <span>2nd Child Lineage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.CHILD3,
                                }}
                              ></div>
                              <span>3rd Child Lineage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: LINEAGE_COLORS.CHILD4,
                                }}
                              ></div>
                              <span>4th Child Lineage</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Connection Types:
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-0.5 bg-gray-700"></div>
                              <span>Parent-Child Relationships</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-0.5 bg-red-600"
                                style={{
                                  borderTop: "2px dashed #dc2626",
                                  background: "none",
                                }}
                              ></div>
                              <span>Marriage/Spouse Relationships</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              All family connections are now visible with proper
                              lines
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
                    <div
                      ref={familyTreeRef}
                      className="w-full min-h-[600px] bg-white overflow-hidden"
                      style={{ height: "calc(100vh - 400px)" }}
                    />
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

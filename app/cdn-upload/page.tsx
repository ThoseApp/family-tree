"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload,
  X,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { BucketFolderEnum } from "@/lib/constants/enums";
import { BUCKET_NAME } from "@/lib/constants";

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const CDNUploadPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ];

  // Authentication handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Check against environment variables
      const validUsername =
        process.env.NEXT_PUBLIC_CDN_USERNAME || "mosuroAdmin123";
      const validPassword =
        process.env.NEXT_PUBLIC_CDN_PASSWORD || "Demo@123..";

      if (username === validUsername && password === validPassword) {
        setIsAuthenticated(true);
        toast.success("Authentication successful!");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // File validation
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload an image file.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) exceeds the 5MB limit.`;
    }

    return null;
  };

  // Upload single file
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${BucketFolderEnum.cdn}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Handle file upload with progress
  const handleFileUpload = useCallback(async (files: File[]) => {
    const validFiles: File[] = [];

    // Validate all files first
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create upload entries
    const newUploads: UploadedImage[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2),
      file,
      url: "",
      status: "uploading" as const,
      progress: 0,
    }));

    setUploadedImages((prev) => [...prev, ...newUploads]);

    // Upload files
    for (const upload of newUploads) {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === upload.id
                ? { ...img, progress: Math.min(img.progress + 10, 90) }
                : img
            )
          );
        }, 200);

        const url = await uploadFile(upload.file);

        clearInterval(progressInterval);

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === upload.id
              ? { ...img, url, status: "success", progress: 100 }
              : img
          )
        );

        toast.success(`${upload.file.name} uploaded successfully!`);
      } catch (error: any) {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === upload.id
              ? { ...img, status: "error", error: error.message, progress: 0 }
              : img
          )
        );

        toast.error(`Failed to upload ${upload.file.name}: ${error.message}`);
      }
    }
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  // File input handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  // Remove uploaded image
  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Clear all images
  const clearAll = () => {
    setUploadedImages([]);
    toast.success("All uploads cleared!");
  };

  // Export URLs
  const exportUrls = () => {
    const successfulUploads = uploadedImages.filter(
      (img) => img.status === "success"
    );
    if (successfulUploads.length === 0) {
      toast.error("No successful uploads to export");
      return;
    }

    const urls = successfulUploads.map((img) => img.url).join("\n");
    const blob = new Blob([urls], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cdn-urls-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("URLs exported successfully!");
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              CDN Upload Access
            </CardTitle>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  CDN Image Upload
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Upload images to Supabase storage and get public URLs
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsAuthenticated(false)}
              >
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop images here or click to browse
              </h3>
              <p className="text-gray-600 mb-4">
                Supports: JPG, PNG, WebP, GIF, SVG, BMP, TIFF (Max 5MB each)
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Results */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Upload Results ({uploadedImages.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportUrls}
                    disabled={
                      uploadedImages.filter((img) => img.status === "success")
                        .length === 0
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export URLs
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {image.status === "success" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {image.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {image.status === "uploading" && (
                          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}

                        <div>
                          <p className="font-medium text-gray-900">
                            {image.file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(image.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            image.status === "success"
                              ? "default"
                              : image.status === "error"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {image.status}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {image.status === "uploading" && (
                      <Progress value={image.progress} className="w-full" />
                    )}

                    {image.status === "error" && image.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">{image.error}</p>
                      </div>
                    )}

                    {image.status === "success" && image.url && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            Public URL:
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(image.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={image.url}
                          readOnly
                          className="text-sm font-mono bg-gray-50"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {uploadedImages.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Files</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {
                      uploadedImages.filter((img) => img.status === "success")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {
                      uploadedImages.filter((img) => img.status === "error")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      uploadedImages.filter((img) => img.status === "uploading")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Uploading</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CDNUploadPage;

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, EyeOff } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 p-4 md:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* PROFILE PHOTO SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">
                Profile Photo
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                This image will be displayed on your profile
              </CardDescription>
            </CardHeader>
          </div>
          <div className="md:col-span-2">
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-yellow-50/30">
                <div className="bg-yellow-100 p-3 rounded-lg mb-3">
                  <UploadCloud className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-yellow-600 font-semibold cursor-pointer">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or JPEG (Recommended size 600-1000px)
                </p>
                {/* Placeholder for actual file input/upload logic */}
                <input type="file" className="hidden" />
              </div>
            </CardContent>
            <CardFooter className="p-0 mt-4 flex justify-end gap-x-3">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Save
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      {/* PERSONAL INFORMATION SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Upload your information here
              </CardDescription>
            </CardHeader>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div>
              <Label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                rows={5}
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
              />
            </div>
            <div className="relative">
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="bg-yellow-50/30 border-gray-200 rounded-lg pr-10"
              />
              <span className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center cursor-pointer">
                <EyeOff className="h-5 w-5 text-gray-400" />
              </span>
            </div>
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

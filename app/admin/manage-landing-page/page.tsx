import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const ManageLandingPagePage = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Manage Landing Page</h1>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=" grid grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-200 h-64 w-full rounded mb-4 flex items-center justify-center text-gray-500">
                [Image Placeholder]
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
              >
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input type="text" placeholder="" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Subheading</Label>
                <Textarea placeholder="" className="bg-background"></Textarea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <div className="grid grid-cols-2 gap-6 ">
        {/* Gallery Preview Section */}
        <Card className=" ">
          <CardHeader>
            <CardTitle>Gallery Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input type="text" placeholder="" />
              </div>
              <div className="flex space-x-2 ">
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
              </div>
              <Button
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                size="lg"
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 h-40 w-full rounded mb-4 flex items-center justify-center text-gray-500">
              [Image Placeholder]
            </div>
            <Button
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
              size="lg"
            >
              Edit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <Card>
        <CardHeader>
          <CardTitle>History Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=" grid grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-200 h-64 w-full rounded mb-4 flex items-center justify-center text-gray-500">
                [Image Placeholder]
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
              >
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input type="text" placeholder="" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Subheading</Label>
                <Textarea placeholder="" className="bg-background"></Textarea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Section */}
      <Card className=" ">
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input type="text" placeholder="" />
            </div>
            <div className="flex space-x-2 ">
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
            </div>
            <Button
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
              size="lg"
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Tree Section */}
      <Card>
        <CardHeader>
          <CardTitle>Family Tree Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=" grid grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-200 h-64 w-full rounded mb-4 flex items-center justify-center text-gray-500">
                [Image Placeholder]
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
              >
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input type="text" placeholder="" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Subheading</Label>
                <Textarea placeholder="" className="bg-background"></Textarea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className=" flex justify-between items-center mt-12">
        <div>Footer</div>
        <div className="space-x-2">
          <Button variant="outline" className="rounded-full">
            Preview
          </Button>
          <Button variant="outline" className="rounded-full">
            Save
          </Button>
        </div>
        <Button className=" rounded-full bg-foreground text-background hover:bg-foreground/80">
          Publish
        </Button>
      </div>
    </div>
  );
};

export default ManageLandingPagePage;

import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Paperclip } from "lucide-react"; // Placeholder icon

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

const NewNoticeCard = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Notice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="" className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            {/* Basic tag input simulation - needs proper implementation */}
            <div className="flex items-center gap-2 p-2 border rounded-md min-h-[40px]">
              <Badge variant="secondary">#Event</Badge>
              {/* Input area would go here for adding new tags */}
            </div>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            <Paperclip className="h-4 w-4" />
            <span>Attach Image</span>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="pin" />
            <Label
              htmlFor="pin"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pin this notice
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Post</Button>
      </CardFooter>
    </Card>
  );
};

export default NewNoticeCard;

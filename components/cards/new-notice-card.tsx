import React, { useState, KeyboardEvent } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Paperclip, X } from "lucide-react"; // Placeholder icon and X icon for removing tags

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

const NewNoticeCard = () => {
  const [tags, setTags] = useState<string[]>(["#Event"]);
  const [tagInput, setTagInput] = useState<string>("");

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInput.trim() !== "") {
      event.preventDefault(); // Prevent potential form submission
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput(""); // Clear the input
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

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
            {/* Updated tag container */}
            <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px]">
              {/* Render existing tags */}
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="tag"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(index)}
                  />
                </Badge>
              ))}
              {/* Input for adding new tags */}
              <Input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto py-0 px-1 text-sm min-w-[80px]" // Simple styling
              />
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
        <Button className="bg-foreground hover:bg-foreground/80 text-background">
          Post
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewNoticeCard;

import React, { useState, KeyboardEvent } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Paperclip, X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import { NoticeBoard } from "@/lib/types";
import { LoadingIcon } from "../loading-icon";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

interface NewNoticeCardProps {
  onClose: () => void;
  onSubmit?: (data: Omit<NoticeBoard, "id">) => Promise<void>;
  loading?: boolean;
}

const NewNoticeCard = ({
  onClose,
  onSubmit,
  loading = false,
}: NewNoticeCardProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>(["#Event"]);
  const [tagInput, setTagInput] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInput.trim() !== "") {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, BucketFolderEnum.notice_boards);
      if (imageUrl) {
        setImage(imageUrl);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const noticeData: Omit<NoticeBoard, "id"> = {
      title: title.trim(),
      description: description.trim(),
      image,
      pinned,
      tags,
      editor: "", // This will be set by the parent component
      posteddate: new Date().toISOString().split("T")[0],
      postedtime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    };

    if (onSubmit) {
      try {
        await onSubmit(noticeData);
        // Reset form after successful submission
        setTitle("");
        setDescription("");
        setImage("");
        setPinned(false);
        setTags(["#Event"]);
        setTagInput("");
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    try {
      return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/")
      );
    } catch {
      return false;
    }
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
            <Input
              id="title"
              placeholder="Enter notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading || uploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter notice description"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || uploading}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            {image && isValidImageUrl(image) ? (
              <div className="relative w-full h-40 rounded border overflow-hidden">
                <Image
                  src={image}
                  alt="Notice image preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                  disabled={loading || uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading || uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <LoadingIcon className="h-4 w-4" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4" />
                      <span>Attach Image</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px]">
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
              <Input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                disabled={loading || uploading}
                className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto py-0 px-1 text-sm min-w-[80px]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pin"
              checked={pinned}
              onCheckedChange={(checked) => setPinned(checked as boolean)}
              disabled={loading || uploading}
            />
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
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading || uploading}
        >
          Cancel
        </Button>
        <Button
          className="bg-foreground hover:bg-foreground/80 text-background"
          onClick={handleSubmit}
          disabled={
            loading || uploading || !title.trim() || !description.trim()
          }
        >
          {loading ? (
            <>
              <LoadingIcon className="h-4 w-4 mr-2" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewNoticeCard;

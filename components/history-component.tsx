"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useHistoryStore } from "@/stores/history-store";
import { HistoryItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { useUserStore } from "@/stores/user-store";

const historyFormSchema = z.object({
  year: z.string().min(1, "Year is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type HistoryFormValues = z.infer<typeof historyFormSchema>;

// Generate year options from current year down to 1800
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1800 + 1 },
  (_, i) => currentYear - i
).map((year) => year.toString());

const HistoryComponent = () => {
  const { user } = useUserStore();
  const {
    userHistoryItems,
    isLoading,
    fetchUserHistory,
    addHistoryItem,
    updateHistoryItem,
    deleteHistoryItem,
  } = useHistoryStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<HistoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserHistory(user.id);
    }
  }, [fetchUserHistory, user]);

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: {
      year: "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        year: editing.year,
        title: editing.title,
        description: editing.description,
      });
    } else {
      form.reset({
        year: "",
        title: "",
        description: "",
      });
    }
  }, [editing, form]);

  const onSubmit = async (values: HistoryFormValues) => {
    if (editing) {
      await updateHistoryItem(editing.id, {
        ...values,
        user_id: user?.id,
      });
      setEditing(null);
    } else {
      await addHistoryItem({
        ...values,
        user_id: user?.id ?? "",
      });
      setShowAddForm(false);
    }
    form.reset();
  };

  const handleDelete = async (id: string) => {
    await deleteHistoryItem(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 ">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family History Records</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-foreground text-background rounded-full hover:bg-foreground/80 flex items-center gap-2 px-4 py-2"
          >
            <Plus className="size-4" />
            <span>Add New Story</span>
          </Button>
        </div>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Add New History Record</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="year">Year</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="title">Title</Label>
                      <FormControl>
                        <Input
                          id="title"
                          placeholder="e.g. Family Reunion"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="description">Description</Label>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Enter a description of this historical event"
                        rows={4}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <LoadingIcon className="mr-2" />}
                  Save Story
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit History Record</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-year">Year</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="edit-title">Title</Label>
                      <FormControl>
                        <Input
                          id="edit-title"
                          placeholder="e.g. Family Reunion"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="edit-description">Description</Label>
                    <FormControl>
                      <Textarea
                        id="edit-description"
                        placeholder="Enter a description of this historical event"
                        rows={4}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <LoadingIcon className="mr-2" />}
                  Update Story
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              history record from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {isLoading ? <LoadingIcon /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LOADING STATE */}
      {isLoading && !userHistoryItems.length && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !userHistoryItems.length && (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No history records yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start adding your family&apos;s historical events and stories.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Story
          </Button>
        </div>
      )}

      {/* TIMELINE SECTION */}
      {userHistoryItems.length > 0 && (
        <div className="pl-8 border-l-2 border-gray-200">
          {userHistoryItems.map((item) => (
            <div key={item.id} className="relative mb-8 ml-4">
              {/* Timeline Marker */}
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full top-1 -left-[calc(3rem+7px)] border-2 border-white"></div>

              <div className="flex-1">
                {/* Year and Title Wrapper */}
                <div className="flex items-baseline mb-1">
                  <time className="text-base font-semibold text-gray-600 mr-3">
                    {item.year}
                  </time>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </div>
                {/* Description */}
                <p className="text-base font-normal text-gray-500">
                  {item.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 py-1 text-sm"
                    onClick={() => setEditing(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 py-1 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteConfirm(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryComponent;

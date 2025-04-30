"use client";

import { FamilyMember } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<FamilyMember>[] = [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className=" text-left">{row.index + 1}</div>;
    },
  },

  {
    id: "name",
    header: "Name",
    cell({ row }) {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <Image
            src={user.imageSrc}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <p className="text-sm text-left ">{user.name}</p>
        </div>
      );
    },
  },

  {
    id: "gender",
    header: "Gender",

    accessorKey: "gender",
    cell(props) {
      const { row } = props;
      const user = row.original;

      return <p className="text-sm text-left ">{user.gender}</p>;
    },
  },

  {
    id: "birthDate",
    header: "Birth Date",
    accessorKey: "birthDate",

    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="text-left text-xs md:text-sm ">{user.birthDate}</div>
      );
    },
  },

  {
    id: "fatherName",
    header: "Father Name",
    accessorKey: "fatherName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm ")}>
          {user.fatherName}
        </div>
      );
    },
  },

  {
    id: "motherName",
    header: "Mother Name",
    accessorKey: "motherName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm ")}>
          {user.motherName}
        </div>
      );
    },
  },
  {
    id: "orderOfBirth",
    header: "Order of Birth",
    accessorKey: "orderOfBirth",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm ">{user.orderOfBirth}</div>
      );
    },
  },
  {
    id: "spouseName",
    header: "Spouse Name",
    accessorKey: "spouseName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm ">{user.spouseName}</div>
      );
    },
  },
  {
    id: "orderOfMarriage",
    header: "Order of Marriage",
    accessorKey: "orderOfMarriage",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm ">
          {user.orderOfMarriage}
        </div>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <Button className="flex justify-end" variant="outline">
        Edit
      </Button>
    ),
  },
];

"use client";

import { Album } from "@/stores/album-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderIcon, ImageIcon } from "lucide-react";

export interface AlbumGridProps {
  albums: Album[];
  onAlbumClick?: (album: Album) => void;
  className?: string;
}

interface AlbumCardProps {
  album: Album;
  onClick?: (album: Album) => void;
}

const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(album);
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-white border border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative h-40 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          {album.cover_image ? (
            <Image
              src={album.cover_image}
              alt={album.name}
              fill
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FolderIcon className="w-12 h-12 mb-2" />
              <div className="flex items-center gap-1 text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>{album.item_count}</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
            {album.name}
          </h3>
          {album.description && (
            <p className="text-xs text-gray-500 truncate mb-2">
              {album.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{album.item_count} items</span>
            <span>{new Date(album.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlbumGrid = ({ albums, onAlbumClick, className }: AlbumGridProps) => {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          You have no album yet
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Create your first album to organize your photos and videos
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
        className
      )}
    >
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} onClick={onAlbumClick} />
      ))}
    </div>
  );
};

export default AlbumGrid;

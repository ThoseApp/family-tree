import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

// Dummy data for the timeline items
const historyItems = [
  {
    year: "2020",
    title: "Pa Segun's Biography",
    description:
      "Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.",
  },
  {
    year: "2010",
    title: "Balogun Opens a Factory in Lagos State",
    description:
      "Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.",
  },
  {
    year: "1990",
    title: "Segun Contests For Election",
    description:
      "Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.",
  },
  {
    year: "1980",
    title: "Jamil Wins Best Runner At The Olympics 1980",
    description:
      "Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.",
  },
];

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 p-4 md:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family History Records</h1>
        <div className="flex items-center gap-4">
          <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80 flex items-center gap-2 px-4 py-2">
            <Plus className="size-4" />
            <span>Add New Story</span>
          </Button>
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="pl-8 border-l-2 border-gray-200">
        {historyItems.map((item, index) => (
          <div key={index} className="relative mb-8 ml-4">
            {/* Timeline Marker: Positioned relative to the line */}
            {/* Offset = -(margin-left) - (marker-width / 2) = -1rem - 6px */}
            <div className="absolute w-3 h-3 bg-gray-300 rounded-full top-1 -left-[calc(3rem+7px)] border-2 border-white"></div>

            {/* Remove absolute positioning from time */}
            {/* Content reorganized: Year and Title on the same line */}
            <div className="flex-1">
              {/* Year and Title Wrapper */}
              <div className="flex items-baseline mb-1">
                {/* Make time relative, add margin-right */}
                <time className="text-base font-semibold text-gray-600 mr-3">
                  {item.year}
                </time>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
              {/* Description below year/title */}
              <p className="text-base font-normal text-gray-500">
                {item.description}
              </p>

              {/* Action Buttons: Re-add this section */}
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 py-1 text-sm"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 py-1 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;

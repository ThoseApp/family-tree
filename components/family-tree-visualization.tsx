"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, GitBranch } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// Import family-chart library
// @ts-ignore - family-chart doesn't have type definitions
import f3 from "family-chart";

// Types for database data
interface ProcessedMember {
  id?: number;
  picture_link: string;
  unique_id: string;
  gender: string;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  fathers_last_name: string;
  mothers_first_name: string;
  mothers_last_name: string;
  order_of_birth: number | null;
  order_of_marriage: number | null;
  marital_status: string;
  spouses_first_name: string;
  spouses_last_name: string;
  date_of_birth: string | null;
}

// Family Chart data format
interface FamilyChartMember {
  id: string;
  data: {
    first_name: string;
    last_name: string;
    birthday: string;
    avatar: string;
    gender: string;
    unique_id: string;
    order_of_birth?: number | null;
    order_of_marriage?: number | null;
    marital_status?: string;
    isOriginator?: boolean;
    isTwin?: boolean;
    isPolygamous?: boolean;
    isOutOfWedlock?: boolean;
    lineageColor?: string;
  };
  rels: {
    father?: string;
    mother?: string;
    spouses?: string[];
    children?: string[];
  };
}

// Color scheme for the 4 main lineages
const LINEAGE_COLORS = {
  LAKETU: "#8B4513", // Brown for originator
  EGUNDEBI: "#DC2626", // Red for Egundebi
  EGUNDEBI_MALE_CHILD_1: "#059669", // Green
  EGUNDEBI_MALE_CHILD_2: "#2563EB", // Blue
  EGUNDEBI_MALE_CHILD_3: "#7C3AED", // Purple
  EGUNDEBI_FEMALE_CHILD: "#FBBF24", // Yellow
  DEFAULT: "#6B7280", // Gray for others/spouses
};

const FamilyTreeVisualization = () => {
  const [existingData, setExistingData] = useState<ProcessedMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [familyChartData, setFamilyChartData] = useState<FamilyChartMember[]>(
    []
  );
  const lineageColorCache = useRef(new Map<string, string>());

  // Ref for the family chart container
  const familyTreeRef = useRef<HTMLDivElement>(null);
  const familyChartInstance = useRef<any>(null);

  const getLineageColor = useCallback(
    (member: ProcessedMember, allMembers: ProcessedMember[]): string => {
      const uid = member.unique_id;

      if (lineageColorCache.current.has(uid)) {
        return lineageColorCache.current.get(uid)!;
      }

      // Helper to find member by name
      const findMemberByName = (firstName: string, lastName: string) => {
        return allMembers.find(
          (m) =>
            m.first_name?.toLowerCase().trim() ===
              firstName.toLowerCase().trim() &&
            m.last_name?.toLowerCase().trim() === lastName.toLowerCase().trim()
        );
      };

      // Rule 1: Originator (LAKETU)
      if (uid === "LAKETU" || member.first_name?.toUpperCase() === "LAKETU") {
        lineageColorCache.current.set(uid, LINEAGE_COLORS.LAKETU);
        return LINEAGE_COLORS.LAKETU;
      }

      // Rule 2: Egundebi (ID D01Z00002) is red
      if (
        uid === "D01Z00002" ||
        uid === "EGUNDEBI" ||
        member.first_name?.toUpperCase() === "EGUNDEBI"
      ) {
        lineageColorCache.current.set(uid, LINEAGE_COLORS.EGUNDEBI);
        return LINEAGE_COLORS.EGUNDEBI;
      }

      // Find father
      let father: ProcessedMember | undefined;
      if (member.fathers_first_name && member.fathers_last_name) {
        father = findMemberByName(
          member.fathers_first_name,
          member.fathers_last_name
        );
      }

      // Special case for Egundebi's father
      if (
        !father &&
        (uid === "D01Z00002" ||
          uid === "EGUNDEBI" ||
          member.first_name?.toUpperCase() === "EGUNDEBI")
      ) {
        father = allMembers.find(
          (m) =>
            m.unique_id === "LAKETU" || m.first_name?.toUpperCase() === "LAKETU"
        );
      }

      if (father) {
        const fatherUid = father.unique_id;
        const fatherIsEgundebi =
          fatherUid === "D01Z00002" ||
          fatherUid === "EGUNDEBI" ||
          father.first_name?.toUpperCase() === "EGUNDEBI";

        // Rule 3: Children of Egundebi
        if (fatherIsEgundebi) {
          const isFemale =
            member.gender?.toLowerCase() === "female" ||
            member.gender?.toLowerCase() === "f";
          let color;

          if (isFemale) {
            color = LINEAGE_COLORS.EGUNDEBI_FEMALE_CHILD;
          } else {
            // Male children
            const maleChildrenOfEgundebi = allMembers
              .filter((m) => {
                const isChild =
                  (m.fathers_first_name?.toLowerCase().trim() ===
                    father!.first_name?.toLowerCase().trim() &&
                    m.fathers_last_name?.toLowerCase().trim() ===
                      father!.last_name?.toLowerCase().trim()) ||
                  (m.mothers_first_name?.toLowerCase().trim() ===
                    father!.first_name?.toLowerCase().trim() &&
                    m.mothers_last_name?.toLowerCase().trim() ===
                      father!.last_name?.toLowerCase().trim());
                return (
                  isChild &&
                  (m.gender?.toLowerCase() === "male" ||
                    m.gender?.toLowerCase() === "m")
                );
              })
              .sort(
                (a, b) => (a.order_of_birth || 99) - (b.order_of_birth || 99)
              );

            const maleIndex = maleChildrenOfEgundebi.findIndex(
              (m) => m.unique_id === uid
            );

            switch (maleIndex) {
              case 0:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_1;
                break;
              case 1:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_2;
                break;
              case 2:
                color = LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_3;
                break;
              default:
                color = LINEAGE_COLORS.DEFAULT;
            }
          }
          lineageColorCache.current.set(uid, color);
          return color;
        }

        // Rule 4: Male descendants inherit father's color
        const isMale =
          member.gender?.toLowerCase() === "male" ||
          member.gender?.toLowerCase() === "m";
        if (isMale) {
          const isOriginator =
            member.unique_id === "LAKETU" ||
            member.first_name?.toUpperCase() === "LAKETU";
          const isSpouseByRules =
            (!isOriginator &&
              (!member.fathers_first_name || !member.mothers_first_name)) ||
            (!isOriginator &&
              (member.order_of_birth === null || member.order_of_birth === 0));
          const isSpouse =
            member.unique_id?.charAt(0).toUpperCase() === "S" ||
            isSpouseByRules;

          if (!isSpouse) {
            const fatherColor = getLineageColor(father, allMembers);
            lineageColorCache.current.set(uid, fatherColor);
            return fatherColor;
          }
        }
      }

      // Default for spouses and females not covered by other rules
      lineageColorCache.current.set(uid, LINEAGE_COLORS.DEFAULT);
      return LINEAGE_COLORS.DEFAULT;
    },
    []
  );

  // Business Rules Logic
  const applyBusinessRules = useCallback(
    (member: ProcessedMember, allMembers: ProcessedMember[]) => {
      const uid = member.unique_id;

      const isOriginator =
        uid === "LAKETU" || member.first_name?.toUpperCase() === "LAKETU";

      const isTwin =
        allMembers.filter(
          (m) =>
            m.unique_id !== member.unique_id &&
            m.fathers_first_name === member.fathers_first_name &&
            m.fathers_last_name === member.fathers_last_name &&
            m.mothers_first_name === member.mothers_first_name &&
            m.mothers_last_name === member.mothers_last_name &&
            m.order_of_birth === member.order_of_birth &&
            m.order_of_birth !== null &&
            m.order_of_birth !== 0
        ).length > 0;

      const isPolygamous =
        member.gender?.toLowerCase() === "male" &&
        member.order_of_marriage !== null &&
        member.order_of_marriage > 1 &&
        member.marital_status?.toLowerCase() === "married";

      const isOutOfWedlock =
        (!member.fathers_first_name || !member.fathers_last_name) &&
        (!member.mothers_first_name || !member.mothers_last_name);

      const isSpouseByRules =
        (!isOriginator &&
          (!member.fathers_first_name || !member.mothers_first_name)) ||
        (!isOriginator &&
          (member.order_of_birth === null || member.order_of_birth === 0));

      const lineageColor = getLineageColor(member, allMembers);

      return {
        isOriginator,
        isDescendant:
          uid?.charAt(0).toUpperCase() === "D" ||
          (!isSpouseByRules &&
            member.unique_id?.charAt(0).toUpperCase() !== "S"),
        isSpouse:
          member.unique_id?.charAt(0).toUpperCase() === "S" || isSpouseByRules,
        isTwin,
        isPolygamous,
        isOutOfWedlock,
        lineageColor,
      };
    },
    [getLineageColor]
  );

  // Convert ProcessedMember data to FamilyChart format
  const convertToFamilyChartFormat = useCallback(
    (members: ProcessedMember[]): FamilyChartMember[] => {
      // Create a lookup map for faster searching
      const memberMap = new Map<string, ProcessedMember>();
      const nameMap = new Map<string, ProcessedMember>();

      members.forEach((member) => {
        memberMap.set(member.unique_id, member);
        const nameKey = `${member.first_name?.toLowerCase()}_${member.last_name?.toLowerCase()}`;
        nameMap.set(nameKey, member);
      });

      const chartMembers = members.map((member) => {
        const rules = applyBusinessRules(member, members);

        // Find father
        let father: ProcessedMember | undefined;
        if (member.fathers_first_name && member.fathers_last_name) {
          const fatherKey = `${member.fathers_first_name.toLowerCase()}_${member.fathers_last_name.toLowerCase()}`;
          father = nameMap.get(fatherKey);

          if (!father) {
            father = members.find(
              (m) =>
                m.first_name?.toLowerCase().trim() ===
                  member.fathers_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.fathers_last_name?.toLowerCase().trim()
            );
          }

          // Special case for EGUNDEBI->LAKETU relationship
          if (
            !father &&
            (member.unique_id === "EGUNDEBI" ||
              member.first_name?.toUpperCase() === "EGUNDEBI")
          ) {
            father = members.find(
              (m) =>
                m.unique_id === "LAKETU" ||
                m.first_name?.toUpperCase() === "LAKETU"
            );
          }
        }

        // Find mother
        let mother: ProcessedMember | undefined;
        if (member.mothers_first_name && member.mothers_last_name) {
          const motherKey = `${member.mothers_first_name.toLowerCase()}_${member.mothers_last_name.toLowerCase()}`;
          mother = nameMap.get(motherKey);

          if (!mother) {
            mother = members.find(
              (m) =>
                m.first_name?.toLowerCase().trim() ===
                  member.mothers_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.mothers_last_name?.toLowerCase().trim()
            );
          }
        }

        // Find spouses
        const spouses: string[] = [];
        if (member.spouses_first_name && member.spouses_last_name) {
          const spouseKey = `${member.spouses_first_name.toLowerCase()}_${member.spouses_last_name.toLowerCase()}`;
          let spouse = nameMap.get(spouseKey);

          if (!spouse) {
            spouse = members.find(
              (m) =>
                m.unique_id !== member.unique_id &&
                m.first_name?.toLowerCase().trim() ===
                  member.spouses_first_name?.toLowerCase().trim() &&
                m.last_name?.toLowerCase().trim() ===
                  member.spouses_last_name?.toLowerCase().trim()
            );
          }

          if (spouse) {
            spouses.push(spouse.unique_id);
          }
        }

        // Find back-reference spouses
        const backRefSpouses = members.filter(
          (m) =>
            m.unique_id !== member.unique_id &&
            m.spouses_first_name?.toLowerCase().trim() ===
              member.first_name?.toLowerCase().trim() &&
            m.spouses_last_name?.toLowerCase().trim() ===
              member.last_name?.toLowerCase().trim()
        );

        backRefSpouses.forEach((spouse) => {
          if (!spouses.includes(spouse.unique_id)) {
            spouses.push(spouse.unique_id);
          }
        });

        // Find children
        const children = members
          .filter((m) => {
            const isFatherMatch =
              m.fathers_first_name?.toLowerCase().trim() ===
                member.first_name?.toLowerCase().trim() &&
              m.fathers_last_name?.toLowerCase().trim() ===
                member.last_name?.toLowerCase().trim();

            const isMotherMatch =
              m.mothers_first_name?.toLowerCase().trim() ===
                member.first_name?.toLowerCase().trim() &&
              m.mothers_last_name?.toLowerCase().trim() ===
                member.last_name?.toLowerCase().trim();

            // Special case: Ensure LAKETU is recognized as EGUNDEBI's father
            const isSpecialCase =
              (member.unique_id === "LAKETU" ||
                member.first_name?.toUpperCase() === "LAKETU") &&
              (m.unique_id === "EGUNDEBI" ||
                m.first_name?.toUpperCase() === "EGUNDEBI");

            return isFatherMatch || isMotherMatch || isSpecialCase;
          })
          .map((child) => child.unique_id);

        const chartMember: FamilyChartMember = {
          id: member.unique_id,
          data: {
            first_name: member.first_name || "",
            last_name: member.last_name || "",
            birthday: member.date_of_birth || "",
            avatar: member.picture_link || "",
            gender: member.gender?.toLowerCase() || "unknown",
            unique_id: member.unique_id,
            order_of_birth: member.order_of_birth,
            order_of_marriage: member.order_of_marriage,
            marital_status: member.marital_status,
            ...rules,
          },
          rels: {
            father: father?.unique_id,
            mother: mother?.unique_id,
            spouses: spouses.length > 0 ? spouses : undefined,
            children: children.length > 0 ? children : undefined,
          },
        };

        return chartMember;
      });

      // Apply bidirectional relationship fixing
      return applyBidirectionalRelationshipFix(chartMembers);
    },
    [applyBusinessRules]
  );

  // Bidirectional relationship fixing function
  const applyBidirectionalRelationshipFix = (
    chartData: FamilyChartMember[]
  ): FamilyChartMember[] => {
    const fixedData = chartData.map((member) => ({
      ...member,
      rels: {
        ...member.rels,
        children: member.rels.children ? [...member.rels.children] : undefined,
        spouses: member.rels.spouses ? [...member.rels.spouses] : undefined,
      },
    }));

    // Ensure all children have proper parent references
    fixedData.forEach((member) => {
      if (member.rels.children) {
        member.rels.children.forEach((childId) => {
          const child = fixedData.find((d) => d.id === childId);
          if (child) {
            if (member.data.gender === "male" || member.data.gender === "m") {
              if (!child.rels.father) {
                child.rels.father = member.id;
              }
            } else if (
              member.data.gender === "female" ||
              member.data.gender === "f"
            ) {
              if (!child.rels.mother) {
                child.rels.mother = member.id;
              }
            }
          }
        });
      }
    });

    // Ensure all parents have children in their children array
    fixedData.forEach((member) => {
      if (member.rels.father) {
        const father = fixedData.find((d) => d.id === member.rels.father);
        if (father) {
          if (!father.rels.children) {
            father.rels.children = [];
          }
          if (!father.rels.children.includes(member.id)) {
            father.rels.children.push(member.id);
          }
        }
      }

      if (member.rels.mother) {
        const mother = fixedData.find((d) => d.id === member.rels.mother);
        if (mother) {
          if (!mother.rels.children) {
            mother.rels.children = [];
          }
          if (!mother.rels.children.includes(member.id)) {
            mother.rels.children.push(member.id);
          }
        }
      }
    });

    // Special fix for LAKETU-EGUNDEBI relationship
    const laketu = fixedData.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
    );
    const egundebi = fixedData.find(
      (d) =>
        d.id === "EGUNDEBI" || d.data.first_name?.toUpperCase() === "EGUNDEBI"
    );

    if (laketu && egundebi) {
      if (!egundebi.rels.father) {
        egundebi.rels.father = laketu.id;
      }
      if (!laketu.rels.children) {
        laketu.rels.children = [];
      }
      if (!laketu.rels.children.includes(egundebi.id)) {
        laketu.rels.children.push(egundebi.id);
      }
    }

    // Remove empty arrays
    fixedData.forEach((member) => {
      if (member.rels.children && member.rels.children.length === 0) {
        member.rels.children = undefined;
      }
      if (member.rels.spouses && member.rels.spouses.length === 0) {
        member.rels.spouses = undefined;
      }
    });

    return fixedData;
  };

  // Initialize Family Chart
  const initializeFamilyChart = useCallback((data: FamilyChartMember[]) => {
    if (!familyTreeRef.current || data.length === 0) return;

    // Clear previous chart
    if (familyChartInstance.current) {
      familyTreeRef.current.innerHTML = "";
    }

    // Find the originator
    const originator = data.find(
      (d) => d.id === "LAKETU" || d.data.first_name?.toUpperCase() === "LAKETU"
    );

    if (!originator) {
      console.error("No originator found in data");
      toast.error("No LAKETU originator found in family data");
      return;
    }

    try {
      if (!f3 || !f3.createSvg || !f3.CalculateTree || !f3.view) {
        throw new Error("Family-chart library methods are not available");
      }

      const svg = f3.createSvg(familyTreeRef.current);
      if (!svg) {
        throw new Error("Failed to create SVG element");
      }

      const tree_data = f3.CalculateTree({
        data: data,
        node_separation: 500,
        level_separation: 450,
        main_id: originator.id,
      });

      if (!tree_data || !tree_data.data) {
        throw new Error("Failed to calculate tree data");
      }

      const wrap = (
        text: d3.Selection<SVGTextElement, unknown, null, undefined>,
        width: number
      ) => {
        text.each(function () {
          const text = d3.select(this);
          const words = text.text().split(/\s+/).reverse();
          let word: string | undefined;
          let line: string[] = [];
          let lineNumber = 0;
          const lineHeight = 1.2; // ems
          const x = text.attr("x");
          const y = text.attr("y");
          const dy = parseFloat(text.attr("dy") || "0");
          text.text(null);

          let tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em");

          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            const node = tspan.node() as SVGTextContentElement;
            if (node.getComputedTextLength() > width && line.length > 1) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            }
          }
        });
      };

      // Custom card function for styling nodes
      const Card = (onClick: (d: any) => void) => {
        return function (this: any, d: any) {
          const member = d.data.data || d.data;
          const isFemale = member.gender === "female" || member.gender === "f";
          const lineageColor = member.lineageColor || LINEAGE_COLORS.DEFAULT;
          const placeholderBgColor = "#d1d5db"; // gray-300
          const textColor = "white"; // white text for better contrast

          this.innerHTML = "";

          const width = 140;
          const height = 180;
          const borderRadius = 15;

          const g = d3
            .select(this)
            .append("g")
            .attr("transform", `translate(${-width / 2}, ${-height / 2})`)
            .attr("class", "card")
            .attr("data-id", member.unique_id)
            .attr("cursor", "pointer")
            .on("click", () => onClick.call(this, d));

          // Main card rect for both genders
          g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("rx", borderRadius)
            .attr("ry", borderRadius)
            .attr("fill", lineageColor)
            .attr("stroke", "#4b5563") // gray-600
            .attr("stroke-width", 2);

          // Image placeholder
          if (isFemale) {
            // Circular image placeholder for females
            g.append("circle")
              .attr("cx", width / 2)
              .attr("cy", 60)
              .attr("r", 45)
              .attr("fill", placeholderBgColor);
          } else {
            // Rectangular image placeholder for males
            g.append("rect")
              .attr("x", 20)
              .attr("y", 15)
              .attr("width", width - 40)
              .attr("height", 90)
              .attr("rx", borderRadius - 5)
              .attr("ry", borderRadius - 5)
              .attr("fill", placeholderBgColor);
          }

          // Add name text
          const nameText = `${member.first_name} ${member.last_name}`;

          g.append("text")
            .attr("x", width / 2)
            .attr("y", 130)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("fill", textColor)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text(nameText)
            .call(wrap as any, width - 20);
        };
      };

      // Click handler
      const onCardClick = (d: any) => {
        const member = d.data.data || d.data;
        toast.info(`${member.first_name} ${member.last_name}`, {
          description: `ID: ${member.unique_id}${
            member.birthday
              ? ` | Born: ${new Date(member.birthday).getFullYear()}`
              : ""
          }${
            member.marital_status ? ` | Status: ${member.marital_status}` : ""
          }`,
        });
      };

      // Render the tree
      f3.view(tree_data, svg, Card(onCardClick));

      // Add zoom functionality
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          const container = d3.select(svg).select(".view");
          if (container.node()) {
            container.attr("transform", event.transform);
          }
        });

      d3.select(svg).call(zoom as any);

      // Set initial zoom to fit the tree
      setTimeout(() => {
        try {
          const container = d3.select(svg);
          const viewBox = svg.getBBox();
          const containerWidth = familyTreeRef.current!.offsetWidth;
          const containerHeight = Math.max(600, window.innerHeight - 300);

          if (viewBox.width > 0 && viewBox.height > 0) {
            const scaleX = (containerWidth * 0.8) / viewBox.width;
            const scaleY = (containerHeight * 0.8) / viewBox.height;
            const scale = Math.min(scaleX, scaleY, 1);

            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;
            const translateX =
              centerX - (viewBox.x + viewBox.width / 2) * scale;
            const translateY =
              centerY - (viewBox.y + viewBox.height / 2) * scale;

            const initialTransform = d3.zoomIdentity
              .translate(translateX, translateY)
              .scale(scale);

            container.call(zoom.transform as any, initialTransform);
          }
        } catch (zoomError) {
          console.warn("Could not set initial zoom:", zoomError);
        }
      }, 500);

      familyChartInstance.current = { svg, tree_data, zoom };

      // Make it responsive
      const handleResize = () => {
        if (familyTreeRef.current) {
          const newWidth = familyTreeRef.current.offsetWidth;
          const newHeight = Math.max(600, window.innerHeight - 300);

          d3.select(svg).attr("width", newWidth).attr("height", newHeight);
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    } catch (error) {
      console.error("Error initializing family chart:", error);
      toast.error("Failed to initialize family tree visualization");

      // Fallback message
      if (familyTreeRef.current) {
        familyTreeRef.current.innerHTML = `
          <div class="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Family Tree Visualization Error</h3>
              <p class="mt-1 text-sm text-gray-500">Unable to render the family tree. Found ${data.length} family members.</p>
              <p class="mt-1 text-xs text-gray-400">Check the console for more details or try refreshing the page.</p>
            </div>
          </div>
        `;
      }
    }
  }, []);

  const refreshData = async () => {
    setIsLoadingData(true);
    lineageColorCache.current.clear();
    try {
      const { data, error } = await supabase
        .from("family-tree")
        .select()
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to refresh data");
      } else {
        setExistingData(data as ProcessedMember[]);
        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      setIsLoadingData(true);
      lineageColorCache.current.clear();
      try {
        const { data, error } = await supabase.from("family-tree").select();

        if (error) {
          console.error("Error fetching existing data:", error);
          toast.error("Failed to fetch existing data");
        } else {
          setExistingData(data as ProcessedMember[]);
        }
      } catch (error) {
        console.error("Error fetching existing data:", error);
        toast.error("Failed to fetch existing data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExistingData();
  }, []);

  // Update family chart when data changes
  useEffect(() => {
    if (existingData.length > 0) {
      const chartData = convertToFamilyChartFormat(existingData);
      setFamilyChartData(chartData);
      initializeFamilyChart(chartData);
    }
  }, [existingData, initializeFamilyChart, convertToFamilyChartFormat]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Family Tree</h2>
          <p className="text-muted-foreground">
            Interactive family tree visualization
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshData}
          disabled={isLoadingData}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Family Tree Display */}
      {!isLoadingData && existingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Family Tree ({existingData.length} members)
            </CardTitle>
            <CardDescription>
              Interactive family tree with click actions and zoom functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              {familyChartData.length > 0 ? (
                <div>
                  {/* Legend */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Lineage Colors:</h4>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.LAKETU,
                              }}
                            ></div>
                            <span>LAKETU (Originator)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.EGUNDEBI,
                              }}
                            ></div>
                            <span>EGUNDEBI (is Red)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_1,
                              }}
                            ></div>
                            <span>Egundebi Male Child 1 (Green)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_2,
                              }}
                            ></div>
                            <span>Egundebi Male Child 2 (Blue)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  LINEAGE_COLORS.EGUNDEBI_MALE_CHILD_3,
                              }}
                            ></div>
                            <span>Egundebi Male Child 3 (Purple)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  LINEAGE_COLORS.EGUNDEBI_FEMALE_CHILD,
                              }}
                            ></div>
                            <span>Egundebi Female Child (Yellow)</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Shapes & Badges:</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-3 bg-gray-400 rounded"></div>
                            <span>Male (Rectangle)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                            <span>Female (Circle)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <span>Originator Badge</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span>Twin Badge</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span>Polygamous Badge</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">
                          Interactive Features:
                        </h4>
                        <ul className="text-xs space-y-1">
                          <li>• Click on any family member to see details</li>
                          <li>• Zoom in/out using mouse wheel or pinch</li>
                          <li>• Pan by dragging the background</li>
                          <li>• Tree auto-zooms to fit on initial load</li>
                          <li>• Responsive design adapts to screen size</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Family Chart Container */}
                  <div
                    ref={familyTreeRef}
                    className="w-full min-h-[600px] bg-white overflow-hidden"
                    style={{ height: "calc(100vh - 350px)" }}
                  >
                    {/* CSS Styles for family-chart connections */}
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                          .links_view path.link {
                            stroke: #000000 !important;
                            stroke-width: 3px !important;
                          }
                          .link {
                            stroke: #000000 !important;
                            stroke-width: 3px !important;
                          }
                        `,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Family Tree Data
                  </h3>
                  <p className="text-gray-500">
                    No family data available to display. Please check if data
                    has been uploaded in the admin section.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoadingData && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading family tree data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoadingData && existingData.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Family Data Available
              </h3>
              <p className="text-gray-500">
                No family members found in the database. Please upload family
                data through the admin section first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyTreeVisualization;

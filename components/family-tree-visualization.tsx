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
  EGUNDEBI: "#2563EB", // Blue for first Mosuro
  ADELAJA: "#DC2626", // Red for first child
  CHILD2: "#059669", // Green for second child
  CHILD3: "#7C3AED", // Purple for third child
  CHILD4: "#EA580C", // Orange for fourth child
  DEFAULT: "#6B7280", // Gray for others
};

const FamilyTreeVisualization = () => {
  const [existingData, setExistingData] = useState<ProcessedMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [familyChartData, setFamilyChartData] = useState<FamilyChartMember[]>(
    []
  );

  // Ref for the family chart container
  const familyTreeRef = useRef<HTMLDivElement>(null);
  const familyChartInstance = useRef<any>(null);

  // Business Rules Logic
  const findParentLineage = (
    member: ProcessedMember,
    allMembers: ProcessedMember[]
  ): string => {
    const father = allMembers.find(
      (m) =>
        m.first_name === member.fathers_first_name &&
        m.last_name === member.fathers_last_name
    );

    if (father) {
      if (
        father.unique_id === "LAKETU" ||
        father.first_name?.toUpperCase() === "LAKETU"
      ) {
        return LINEAGE_COLORS.LAKETU;
      } else if (
        father.unique_id === "EGUNDEBI" ||
        father.first_name?.toUpperCase() === "EGUNDEBI"
      ) {
        return LINEAGE_COLORS.EGUNDEBI;
      } else if (father.first_name?.toUpperCase() === "ADELAJA") {
        return LINEAGE_COLORS.ADELAJA;
      }

      const fatherParent = allMembers.find(
        (m) =>
          m.first_name === father.fathers_first_name &&
          m.last_name === father.fathers_last_name &&
          (m.unique_id === "EGUNDEBI" ||
            m.first_name?.toUpperCase() === "EGUNDEBI")
      );

      if (fatherParent) {
        const birthOrder = father.order_of_birth || 0;
        switch (birthOrder) {
          case 1:
            return father.first_name?.toUpperCase() === "ADELAJA"
              ? LINEAGE_COLORS.ADELAJA
              : LINEAGE_COLORS.CHILD2;
          case 2:
            return LINEAGE_COLORS.CHILD2;
          case 3:
            return LINEAGE_COLORS.CHILD3;
          case 4:
            return LINEAGE_COLORS.CHILD4;
          default:
            if (father.first_name?.toUpperCase() === "ADELAJA")
              return LINEAGE_COLORS.ADELAJA;
            return LINEAGE_COLORS.CHILD2;
        }
      }
    }

    return LINEAGE_COLORS.DEFAULT;
  };

  const applyBusinessRules = (
    member: ProcessedMember,
    allMembers: ProcessedMember[]
  ) => {
    const uid = member.unique_id;

    const isDescendant = uid?.charAt(0).toUpperCase() === "D";
    const isSpouse = uid?.charAt(0).toUpperCase() === "S";
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

    let lineageColor = LINEAGE_COLORS.DEFAULT;

    if (isOriginator) {
      lineageColor = LINEAGE_COLORS.LAKETU;
    } else if (
      uid === "EGUNDEBI" ||
      member.first_name?.toUpperCase() === "EGUNDEBI"
    ) {
      lineageColor = LINEAGE_COLORS.EGUNDEBI;
    } else if (member.first_name?.toUpperCase() === "ADELAJA") {
      lineageColor = LINEAGE_COLORS.ADELAJA;
    } else {
      const isEgundebisChild =
        member.fathers_first_name?.toUpperCase() === "EGUNDEBI" ||
        member.mothers_first_name?.toUpperCase() === "EGUNDEBI";

      if (isEgundebisChild) {
        const birthOrder = member.order_of_birth || 0;
        switch (birthOrder) {
          case 1:
            lineageColor =
              member.first_name?.toUpperCase() === "ADELAJA"
                ? LINEAGE_COLORS.ADELAJA
                : LINEAGE_COLORS.CHILD2;
            break;
          case 2:
            lineageColor = LINEAGE_COLORS.CHILD2;
            break;
          case 3:
            lineageColor = LINEAGE_COLORS.CHILD3;
            break;
          case 4:
            lineageColor = LINEAGE_COLORS.CHILD4;
            break;
          default:
            if (member.first_name?.toUpperCase() === "ADELAJA") {
              lineageColor = LINEAGE_COLORS.ADELAJA;
            } else {
              lineageColor = LINEAGE_COLORS.CHILD2;
            }
        }
      } else {
        const parentLineage = findParentLineage(member, allMembers);
        lineageColor = parentLineage || LINEAGE_COLORS.DEFAULT;
      }
    }

    return {
      isOriginator,
      isDescendant: isDescendant || (!isSpouse && !isSpouseByRules),
      isSpouse: isSpouse || isSpouseByRules,
      isTwin,
      isPolygamous,
      isOutOfWedlock,
      lineageColor,
    };
  };

  // Convert ProcessedMember data to FamilyChart format
  const convertToFamilyChartFormat = (
    members: ProcessedMember[]
  ): FamilyChartMember[] => {
    console.log("Converting family data - total members:", members.length);

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
  };

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
        level_separation: 350,
        main_id: originator.id,
      });

      if (!tree_data || !tree_data.data) {
        throw new Error("Failed to calculate tree data");
      }

      // Custom card function for styling nodes
      const Card = (onClick: (d: any) => void) => {
        return function (this: any, d: any) {
          const member = d.data.data || d.data;
          const isCircular =
            member.gender === "female" || member.gender === "f";
          const backgroundColor = member.lineageColor || LINEAGE_COLORS.DEFAULT;

          this.innerHTML = "";

          const g = d3
            .select(this)
            .append("g")
            .attr("transform", `translate(${[-100, isCircular ? -100 : -75]})`)
            .attr("class", "card")
            .attr("data-id", member.unique_id)
            .attr("cursor", "pointer")
            .on("click", () => onClick.call(this, d));

          // Create shape
          if (isCircular) {
            g.append("circle")
              .attr("cx", 100)
              .attr("cy", 100)
              .attr("r", 100)
              .attr("fill", backgroundColor)
              .attr("stroke", "#000")
              .attr("stroke-width", member.isOriginator ? 3 : 1);
          } else {
            g.append("rect")
              .attr("width", 200)
              .attr("height", 150)
              .attr("rx", 8)
              .attr("ry", 8)
              .attr("fill", backgroundColor)
              .attr("stroke", "#000")
              .attr("stroke-width", member.isOriginator ? 3 : 1);
          }

          // Add name text
          const nameText = `${member.first_name} ${member.last_name}`;
          const nameParts = nameText.split(" ");

          if (nameParts.length > 1 && nameText.length > 15) {
            g.append("text")
              .attr("x", 100)
              .attr("y", isCircular ? 85 : 60)
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-size", "14px")
              .attr("font-weight", "bold")
              .text(nameParts[0]);

            g.append("text")
              .attr("x", 100)
              .attr("y", isCircular ? 105 : 80)
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-size", "14px")
              .attr("font-weight", "bold")
              .text(nameParts.slice(1).join(" "));
          } else {
            g.append("text")
              .attr("x", 100)
              .attr("y", isCircular ? 95 : 70)
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-size", "14px")
              .attr("font-weight", "bold")
              .text(nameText);
          }

          // Add ID text
          g.append("text")
            .attr("x", 100)
            .attr("y", isCircular ? 120 : 95)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("opacity", 0.8)
            .text(member.unique_id);

          // Add birth year if available
          if (member.birthday) {
            g.append("text")
              .attr("x", 100)
              .attr("y", isCircular ? 135 : 115)
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-size", "11px")
              .attr("opacity", 0.7)
              .text(new Date(member.birthday).getFullYear());
          }

          // Add badges for special attributes
          let badgeX = isCircular ? 170 : 180;
          let badgeY = 10;

          if (member.isOriginator) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 8)
              .attr("fill", "#fbbf24")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
            badgeY += 20;
          }

          if (member.isTwin) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 8)
              .attr("fill", "#60a5fa")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
            badgeY += 20;
          }

          if (member.isPolygamous) {
            g.append("circle")
              .attr("cx", badgeX)
              .attr("cy", badgeY)
              .attr("r", 8)
              .attr("fill", "#f87171")
              .attr("stroke", "#000")
              .attr("stroke-width", 1);
          }
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
  }, [existingData, initializeFamilyChart]);

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
                            <span>EGUNDEBI (First Mosuro)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.ADELAJA,
                              }}
                            ></div>
                            <span>ADELAJA Lineage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.CHILD2,
                              }}
                            ></div>
                            <span>2nd Child Lineage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.CHILD3,
                              }}
                            ></div>
                            <span>3rd Child Lineage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: LINEAGE_COLORS.CHILD4,
                              }}
                            ></div>
                            <span>4th Child Lineage</span>
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

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Tree, { TreeNodeDatum, CustomNodeElementProps } from "react-d3-tree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Users, Heart } from "lucide-react";
import { ProcessedMember } from "@/lib/types";
import { dummyProfileImage, dummyFemaleProfileImage } from "@/lib/constants";
import { fetchFamilyMembers } from "@/lib/utils/family-tree-helpers";
import {
  TreeNode,
  FamilyTreeState,
  LineageColor,
  LINEAGE_COLORS,
  createInitialTreeState,
  buildTreeData,
  findSpouses,
  findChildren,
  isDescendant,
  isSpouse,
  validateColorInheritance,
} from "@/lib/utils/family-tree-d3-helpers";

// Custom path function to handle spouse connections
const customPathFunc = (
  linkDatum: any,
  orientation: "vertical" | "horizontal"
): string => {
  const { source, target } = linkDatum;
  const sourceAttrs = source.data.attributes;
  const targetAttrs = target.data.attributes;

  // Standard step path drawing logic for a vertical tree
  const drawStepPath = (s: { x: any; y: any }, t: { x: any; y: any }) => {
    return `M ${s.x},${s.y} V ${(s.y + t.y) / 2} H ${t.x} V ${t.y}`;
  };

  // Hide the link from the ancestor to our invisible "family" group node
  if (targetAttrs?.gender === "family") {
    return "";
  }

  // Find links originating from our invisible "family" group node
  if (sourceAttrs?.gender === "family") {
    const ancestor = source.parent;
    if (!ancestor) return ""; // Should not happen

    // For the actual descendant, draw a path from the true ancestor
    if (targetAttrs?.is_descendant) {
      return drawStepPath({ x: ancestor.x, y: ancestor.y }, target);
    }

    // For the spouse, draw a horizontal line from their partner
    if (targetAttrs?.is_spouse) {
      const descendantNode = source.children?.find(
        (c: { data: { attributes: { is_descendant: any } } }) =>
          c.data.attributes.is_descendant
      );
      if (descendantNode) {
        return `M${descendantNode.x},${descendantNode.y}L${target.x},${target.y}`;
      }
      return "";
    }
  }

  // For monogamous families (exactly one spouse), route child links from the descendant
  // instead of from between parents or from the spouse.
  const isSpouseSource = sourceAttrs?.is_spouse === true;
  const isDescendantSource = sourceAttrs?.is_descendant === true;
  const isChildTarget =
    target.data &&
    target.data.attributes &&
    target.data.attributes.gender !== "family" &&
    !target.data.attributes.is_spouse;
  const parentIsFamily =
    source.parent &&
    source.parent.data &&
    source.parent.data.attributes &&
    source.parent.data.attributes.gender === "family";
  const spouseCount = parentIsFamily
    ? source.parent.data.attributes.spouse_count || 0
    : 0;

  // For monogamous families, children are now directly attached to descendant in tree structure
  // So we only need to handle the standard descendant-to-child connections
  if (
    isDescendantSource &&
    isChildTarget &&
    parentIsFamily &&
    spouseCount === 1
  ) {
    return drawStepPath(source, target);
  }

  // For polygamous families, maintain the original logic where children come from spouses
  if (isSpouseSource && isChildTarget && parentIsFamily && spouseCount > 1) {
    return drawStepPath(source, target);
  }

  // For single parent families (no spouse), children come directly from the descendant
  if (isDescendantSource && isChildTarget && !parentIsFamily) {
    return drawStepPath(source, target);
  }

  // For all other standard links, use the step function
  return drawStepPath(source, target);
};

// Custom node component for family members
const FamilyTreeNode: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  onNodeClick,
}) => {
  const attributes = nodeDatum.attributes as TreeNode["attributes"];
  const lineageColor = attributes?.lineage_color || "neutral";
  const backgroundColor = LINEAGE_COLORS[lineageColor];
  const isSpouseNode = attributes?.is_spouse;
  const hasChildren = attributes?.has_children;
  const gender = attributes?.gender || "unknown";
  const isMultipleBirth = attributes?.is_multiple_birth;
  const multipleBirthLabel = attributes?.multiple_birth_label;

  // Handle special node types
  if (gender === "couple" || gender === "family") {
    return (
      <g>
        {/* Invisible node for tree structure */}
        <circle r={1} fill="transparent" onClick={onNodeClick} />
      </g>
    );
  }

  // Node dimensions
  const nodeWidth = 200;
  const nodeHeight = 220;
  const imageSize = 96;

  // Determine which placeholder image to use
  const placeholderImage =
    gender?.toLowerCase() === "female"
      ? dummyFemaleProfileImage
      : dummyProfileImage;

  // Determine image shape based on gender
  const isCircularImage = gender?.toLowerCase() === "female";

  // Text wrapping logic
  const name = nodeDatum.name;
  const nameParts = name.split(" ");
  const isLongName = name.length > 14;
  let nameLines: string[] = [name];

  if (isLongName && nameParts.length > 1) {
    nameLines = [nameParts[0], nameParts.slice(1).join(" ")];
  } else if (name.length > 18) {
    nameLines = [`${name.substring(0, 18)}...`];
  }

  const nameY = -nodeHeight / 2 + (nameLines.length > 1 ? 128 : 135);
  const uidY = -nodeHeight / 2 + (nameLines.length > 1 ? 155 : 150);
  // Multiple birth badge sizing (dynamic for Twins/Triplets/etc.)
  const badgePaddingX = 10;
  const approxCharWidth = 7.2; // rough width per character for measuring label
  const computedBadgeWidth = Math.max(
    84,
    (multipleBirthLabel?.length || 0) * approxCharWidth + badgePaddingX * 2
  );
  const badgeHeight = 24;
  const badgeX = -nodeWidth / 2 + 8;
  const badgeY = -nodeHeight / 2 + 8;

  return (
    <g onClick={onNodeClick}>
      {/* Main node rectangle with enhanced styling */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        fill={backgroundColor}
        stroke="#E5E7EB"
        strokeWidth={1.5}
        rx={14}
        className="cursor-pointer hover:shadow-lg transition-all duration-200"
        filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))"
      />

      {/* Profile image area */}
      {/* This provides a background color for the image area */}
      {isCircularImage ? (
        <circle
          cx={0}
          cy={-nodeHeight / 2 + 10 + imageSize / 2}
          r={imageSize / 2}
          fill="#E5E7EB"
        />
      ) : (
        <rect
          width={imageSize}
          height={imageSize}
          x={-imageSize / 2}
          y={-nodeHeight / 2 + 10}
          fill="#E5E7EB"
          rx={8}
        />
      )}
      {/* Display member's picture or a gender-specific placeholder */}
      <image
        href={attributes?.picture_link || placeholderImage}
        width={imageSize}
        height={imageSize}
        x={-imageSize / 2}
        y={-nodeHeight / 2 + 10}
        clipPath={`url(#imageClip-${attributes?.unique_id || "node"})`}
        style={{
          filter: "contrast(1.05) saturate(1.05)",
        }}
      />

      {/* Text background for better readability */}
      {/* <rect
        x={-nodeWidth / 2 + 8}
        y={nameY - (nameLines.length > 1 ? 12 : 8)}
        width={nodeWidth - 16}
        height={nameLines.length > 1 ? 32 : 20}
        fill="rgba(255, 255, 255, 0.75)"
        rx={6}
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth={0.5}
      /> */}

      {/* Name text with enhanced visibility */}
      <text
        x={0}
        y={nameY}
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          fill: "#1F2937",
          filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))",
        }}
        stroke="#FFFFFF"
        strokeWidth="0.5"
        paintOrder="stroke fill"
      >
        {nameLines.map((line, index) => (
          <tspan x={0} key={index} dy={index === 0 ? 0 : "1.2em"}>
            {line}
          </tspan>
        ))}
      </text>

      {/* Multiple birth badge */}
      {isMultipleBirth && multipleBirthLabel && (
        <g filter="url(#badgeShadow)" pointerEvents="none">
          <rect
            x={badgeX}
            y={badgeY}
            rx={8}
            width={computedBadgeWidth}
            height={badgeHeight}
            fill="#2563EB"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
          <text
            x={badgeX + computedBadgeWidth / 2}
            y={badgeY + 15}
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            style={{
              fill: "#FFFFFF",
              filter: "drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.4))",
            }}
          >
            {multipleBirthLabel}
          </text>
        </g>
      )}

      {/* UID text */}
      {/* <text
        x={0}
        y={uidY}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        opacity={0.8}
      >
        {attributes?.unique_id}
      </text> */}

      {/* Polygamous marriage indicator */}
      {/* {attributes?.spouse_count && attributes.spouse_count > 1 && (
        <text
          x={nodeWidth / 2 - 10}
          y={nodeHeight / 2 - 10}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {attributes.spouse_count}
        </text>
      )} */}

      {/* Define clip path for images and gradients */}
      <defs>
        <clipPath id={`imageClip-${attributes?.unique_id || "node"}`}>
          {isCircularImage ? (
            <circle
              r={imageSize / 2}
              cx={0}
              cy={-nodeHeight / 2 + 10 + imageSize / 2}
            />
          ) : (
            <rect
              width={imageSize}
              height={imageSize}
              x={-imageSize / 2}
              y={-nodeHeight / 2 + 10}
              rx={8}
            />
          )}
        </clipPath>

        {/* Enhanced gradient for better text contrast */}
        <linearGradient
          id={`nodeGradient-${attributes?.unique_id || "node"}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={backgroundColor} stopOpacity="1" />
          <stop offset="100%" stopColor={backgroundColor} stopOpacity="0.85" />
        </linearGradient>

        {/* Subtle shadow for the multiple birth badge to improve contrast */}
        <filter id="badgeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
        </filter>
      </defs>
    </g>
  );
};

const FamilyTreeComponent: React.FC = () => {
  const [allMembers, setAllMembers] = useState<ProcessedMember[]>([]);
  const [treeState, setTreeState] = useState<FamilyTreeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load family members data
  const loadFamilyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const members = await fetchFamilyMembers();
      setAllMembers(members);

      // Validate color inheritance consistency in development
      if (process.env.NODE_ENV === "development") {
        const colorMap = validateColorInheritance(members);
      }

      // Create initial tree state
      const initialState = createInitialTreeState(members);
      setTreeState(initialState);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load family data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  // Build tree data for react-d3-tree
  const treeData = useMemo(() => {
    if (!treeState || !allMembers.length) return null;

    try {
      return buildTreeData(allMembers, treeState);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to build tree data"
      );
      return null;
    }
  }, [allMembers, treeState]);

  // Helper function to recursively collapse all descendants of a node
  const collapseDescendantsRecursively = useCallback(
    (nodeId: string, state: FamilyTreeState) => {
      const member = allMembers.find((m) => m.unique_id === nodeId);
      if (!member) return;

      const children = findChildren(member, allMembers);

      children.forEach((child) => {
        // Remove child from visible nodes
        state.visibleNodes.delete(child.unique_id);

        // Find and remove child's spouses
        const childSpouses = findSpouses(child, allMembers);
        childSpouses.forEach((spouse) => {
          state.visibleNodes.delete(spouse.unique_id);
        });

        // Remove from expanded sets
        state.expandedSpouses.delete(child.unique_id);
        state.expandedChildren.delete(child.unique_id);

        // Remove spouse assignments for this child
        state.spouseAssignments.delete(child.unique_id);

        // Recursively collapse this child's descendants
        collapseDescendantsRecursively(child.unique_id, state);
      });
    },
    [allMembers]
  );

  // Handle node clicks for progressive disclosure with toggle functionality
  const handleNodeClick = useCallback(
    (nodeDatum: TreeNodeDatum) => {
      const attributes = nodeDatum.attributes as TreeNode["attributes"];
      const uid = attributes?.unique_id;

      if (!uid || !treeState || !allMembers.length) return;

      // Special handling for the root node if needed
      if (uid === "COUPLE_ROOT") {
        return;
      }

      const member = allMembers.find((m) => m.unique_id === uid);
      if (!member) return;

      const newState = {
        ...treeState,
        visibleNodes: new Set(treeState.visibleNodes),
        expandedSpouses: new Set(treeState.expandedSpouses),
        expandedChildren: new Set(treeState.expandedChildren),
        spouseAssignments: new Map(treeState.spouseAssignments),
      };

      // Special handling for origin couple with toggle functionality
      if (uid === "D00Z00001") {
        // Click on Laketu (origin male)
        if (!newState.visibleNodes.has("S00Z00001")) {
          // EXPAND: Princess not visible → reveal Princess AND first child (like monogamous behavior)
          newState.visibleNodes.add("S00Z00001");
          newState.expandedSpouses.add("D00Z00001");

          // Also reveal first child (Egundebi) to match monogamous descendant behavior
          const egundebi = allMembers.find((m) => m.unique_id === "D01Z00002");
          if (egundebi) {
            newState.visibleNodes.add("D01Z00002");
            newState.currentGeneration = 2;
          }
        } else {
          // COLLAPSE: Princess is visible → hide Princess and ALL descendants
          newState.visibleNodes.delete("S00Z00001");

          // Find and remove all descendants recursively
          const princess = allMembers.find((m) => m.unique_id === "S00Z00001");
          if (princess) {
            collapseDescendantsRecursively("S00Z00001", newState);
          }

          // Remove first child (Egundebi) and all his descendants if visible
          const egundebi = allMembers.find((m) => m.unique_id === "D01Z00002");
          if (egundebi && newState.visibleNodes.has("D01Z00002")) {
            newState.visibleNodes.delete("D01Z00002");
            collapseDescendantsRecursively("D01Z00002", newState);

            // Remove Egundebi's spouses
            const egundebiSpouses = findSpouses(egundebi, allMembers);
            egundebiSpouses.forEach((spouse) => {
              newState.visibleNodes.delete(spouse.unique_id);
              collapseDescendantsRecursively(spouse.unique_id, newState);
            });

            // Clean up tracking
            newState.expandedSpouses.delete("D01Z00002");
            newState.expandedChildren.delete("D01Z00002");
          }

          // Clean up origin tracking
          newState.expandedSpouses.delete("D00Z00001");
          newState.expandedChildren.delete("S00Z00001");

          // Reset to generation 1
          newState.currentGeneration = 1;
        }

        setTreeState({
          visibleNodes: newState.visibleNodes,
          expandedSpouses: newState.expandedSpouses,
          expandedChildren: newState.expandedChildren,
          spouseAssignments: newState.spouseAssignments,
          currentGeneration: newState.currentGeneration,
          lastClickedNodeId: uid,
        });
        return;
      }

      if (uid === "S00Z00001") {
        // Click on Princess (origin female) - since Laketu now handles initial expansion,
        // Princess click only handles collapse if Egundebi is already visible
        const egundebi = allMembers.find((m) => m.unique_id === "D01Z00002");
        if (egundebi && newState.visibleNodes.has("D01Z00002")) {
          // COLLAPSE: First child is visible → hide first child and ALL descendants
          newState.visibleNodes.delete("D01Z00002");
          collapseDescendantsRecursively("D01Z00002", newState);

          // Remove Egundebi's spouses and their descendants (if any were revealed)
          const egundebiSpouses = findSpouses(egundebi, allMembers);
          egundebiSpouses.forEach((spouse) => {
            if (newState.visibleNodes.has(spouse.unique_id)) {
              newState.visibleNodes.delete(spouse.unique_id);
              collapseDescendantsRecursively(spouse.unique_id, newState);
            }
          });

          // Clean up tracking
          newState.expandedSpouses.delete("D01Z00002");
          newState.expandedChildren.delete("D01Z00002");
          egundebiSpouses.forEach((spouse) => {
            newState.expandedSpouses.delete(spouse.unique_id);
            newState.expandedChildren.delete(spouse.unique_id);
          });

          // Recalculate generation counter
          let maxGeneration = 1;
          newState.visibleNodes.forEach((visibleUid) => {
            const visibleMember = allMembers.find(
              (m) => m.unique_id === visibleUid
            );
            if (visibleMember) {
              if (
                visibleMember.fathers_uid === "D00Z00001" ||
                visibleMember.mothers_uid === "S00Z00001"
              ) {
                maxGeneration = Math.max(maxGeneration, 2);
              }
            }
          });
          newState.currentGeneration = maxGeneration;
        }

        setTreeState({
          visibleNodes: newState.visibleNodes,
          expandedSpouses: newState.expandedSpouses,
          expandedChildren: newState.expandedChildren,
          spouseAssignments: newState.spouseAssignments,
          currentGeneration: newState.currentGeneration,
          lastClickedNodeId: uid,
        });
        return;
      }

      const spouses = findSpouses(member, allMembers);
      const children = findChildren(member, allMembers);

      // Determine if the clicked node is a descendant or a spouse
      const isDescendantNode = isDescendant(uid);

      // Check if the click is on a Gen 2 family member (descendant or their spouse)
      const partner = isSpouse(member.unique_id)
        ? allMembers.find((p) => p.unique_id === member.spouse_uid)
        : member;
      const isGen2FamilyClick =
        partner &&
        (partner.fathers_uid === "D00Z00001" ||
          partner.mothers_uid === "S00Z00001");

      let generationChanged = false;

      // Rule: Handle descendants with children but no spouses (single parents)
      if (isDescendantNode && spouses.length === 0 && children.length > 0) {
        const areChildrenVisible = children.every((child) =>
          newState.visibleNodes.has(child.unique_id)
        );

        if (!areChildrenVisible) {
          // EXPAND: Show children for single parent
          children.forEach((child) => {
            newState.visibleNodes.add(child.unique_id);
          });
          newState.expandedChildren.add(uid);

          // Advance the generation when children are revealed
          newState.currentGeneration += 1;
          generationChanged = true;
        } else {
          // COLLAPSE: Hide children and all their descendants
          children.forEach((child) => {
            newState.visibleNodes.delete(child.unique_id);
            collapseDescendantsRecursively(child.unique_id, newState);
          });
          newState.expandedChildren.delete(uid);

          // Recalculate generation counter
          let maxGeneration = 1;
          newState.visibleNodes.forEach((visibleUid) => {
            const visibleMember = allMembers.find(
              (m) => m.unique_id === visibleUid
            );
            if (visibleMember) {
              let generation = 1;
              if (
                visibleMember.fathers_uid === "D00Z00001" ||
                visibleMember.mothers_uid === "S00Z00001"
              ) {
                generation = 2;
              } else if (
                visibleMember.fathers_uid &&
                visibleMember.fathers_uid !== "D00Z00001"
              ) {
                const parent = allMembers.find(
                  (m) => m.unique_id === visibleMember.fathers_uid
                );
                if (
                  parent &&
                  (parent.fathers_uid === "D00Z00001" ||
                    parent.mothers_uid === "S00Z00001")
                ) {
                  generation = 3;
                } else if (
                  parent &&
                  parent.fathers_uid &&
                  parent.fathers_uid !== "D00Z00001"
                ) {
                  generation = 4;
                }
              }
              maxGeneration = Math.max(maxGeneration, generation);
            }
          });
          newState.currentGeneration = maxGeneration;
          generationChanged = true;
        }

        setTreeState({
          visibleNodes: newState.visibleNodes,
          expandedSpouses: newState.expandedSpouses,
          expandedChildren: newState.expandedChildren,
          spouseAssignments: newState.spouseAssignments,
          currentGeneration: newState.currentGeneration,
          lastClickedNodeId: uid,
        });
        return;
      }

      // Rule: Male descendants (D IDs) behavior - for monogamous, show spouse + children together
      if (isDescendantNode && spouses.length > 0) {
        const isMonogamous = spouses.length === 1;

        if (!newState.expandedSpouses.has(uid)) {
          // EXPAND: Reveal spouses if not already visible
          spouses.forEach((spouse) => {
            newState.visibleNodes.add(spouse.unique_id);
          });
          newState.expandedSpouses.add(uid);

          // For monogamous descendants, also reveal children immediately
          if (isMonogamous && children.length > 0) {
            children.forEach((child) => {
              newState.visibleNodes.add(child.unique_id);
            });
            // Mark the spouse as having expanded children since children are shown
            newState.expandedChildren.add(spouses[0].unique_id);

            // Track spouse assignment: Record that this spouse is responsible for these children
            newState.spouseAssignments.set(uid, spouses[0].unique_id);

            // Don't automatically reveal spouses - let them be revealed progressively by clicking each child

            // Advance the generation when children are revealed
            newState.currentGeneration += 1;
            generationChanged = true;
          }
        } else {
          // COLLAPSE: Spouses are visible, so collapse them and ALL their descendants
          spouses.forEach((spouse) => {
            // Remove spouse from visible nodes
            newState.visibleNodes.delete(spouse.unique_id);

            // Collapse all descendants of this spouse recursively
            collapseDescendantsRecursively(spouse.unique_id, newState);

            // Remove from expanded tracking
            newState.expandedSpouses.delete(spouse.unique_id);
            newState.expandedChildren.delete(spouse.unique_id);
          });

          // For monogamous descendants, also collapse children
          if (isMonogamous && children.length > 0) {
            children.forEach((child) => {
              newState.visibleNodes.delete(child.unique_id);
              collapseDescendantsRecursively(child.unique_id, newState);
            });
          }

          // Remove the male descendant from expanded spouses tracking
          newState.expandedSpouses.delete(uid);
          // Remove spouse assignments
          newState.spouseAssignments.delete(uid);

          // Recalculate generation counter by finding the maximum visible generation
          let maxGeneration = 1;
          newState.visibleNodes.forEach((visibleUid) => {
            const visibleMember = allMembers.find(
              (m) => m.unique_id === visibleUid
            );
            if (visibleMember) {
              // Count the generation based on ancestry depth
              let generation = 1;
              if (
                visibleMember.fathers_uid === "D00Z00001" ||
                visibleMember.mothers_uid === "S00Z00001"
              ) {
                generation = 2;
              } else if (
                visibleMember.fathers_uid &&
                visibleMember.fathers_uid !== "D00Z00001"
              ) {
                const parent = allMembers.find(
                  (m) => m.unique_id === visibleMember.fathers_uid
                );
                if (
                  parent &&
                  (parent.fathers_uid === "D00Z00001" ||
                    parent.mothers_uid === "S00Z00001")
                ) {
                  generation = 3;
                } else if (
                  parent &&
                  parent.fathers_uid &&
                  parent.fathers_uid !== "D00Z00001"
                ) {
                  generation = 4; // Could extend this logic further if needed
                }
              }
              maxGeneration = Math.max(maxGeneration, generation);
            }
          });
          newState.currentGeneration = maxGeneration;
          generationChanged = true;
        }
        // For monogamous descendants, we handle children here, so we can return early
        if (isMonogamous) {
          // Skip the spouse-only children expansion logic below
        }
      }
      // Rule: Only spouses (S IDs) can expand/collapse children
      // But skip if this is a monogamous spouse whose descendant partner already handled children
      else if (!isDescendantNode && children.length > 0) {
        // Check if this spouse's descendant partner is monogamous and already expanded
        const descendantPartner = allMembers.find((m) => {
          const memberSpouses = findSpouses(m, allMembers);
          return (
            memberSpouses.some((spouse) => spouse.unique_id === uid) &&
            memberSpouses.length === 1
          ); // monogamous
        });

        // Skip spouse click if monogamous descendant already handled children
        if (
          descendantPartner &&
          newState.expandedSpouses.has(descendantPartner.unique_id)
        ) {
          // Don't process spouse clicks for monogamous families where descendant already expanded
          return;
        }
        const areChildrenVisible = children.every((child) =>
          newState.visibleNodes.has(child.unique_id)
        );

        if (areChildrenVisible && newState.expandedChildren.has(uid)) {
          // COLLAPSE: Children are visible and this node is marked as expanded, so collapse them
          collapseDescendantsRecursively(uid, newState);
          newState.expandedChildren.delete(uid);

          // Decrease generation counter by calculating the maximum visible generation
          let maxGeneration = 1;
          newState.visibleNodes.forEach((visibleUid) => {
            const visibleMember = allMembers.find(
              (m) => m.unique_id === visibleUid
            );
            if (visibleMember) {
              // Count the generation based on ancestry depth
              let generation = 1;
              if (
                visibleMember.fathers_uid === "D00Z00001" ||
                visibleMember.mothers_uid === "S00Z00001"
              ) {
                generation = 2;
              } else if (
                visibleMember.fathers_uid &&
                visibleMember.fathers_uid !== "D00Z00001"
              ) {
                const parent = allMembers.find(
                  (m) => m.unique_id === visibleMember.fathers_uid
                );
                if (
                  parent &&
                  (parent.fathers_uid === "D00Z00001" ||
                    parent.mothers_uid === "S00Z00001")
                ) {
                  generation = 3;
                } else if (
                  parent &&
                  parent.fathers_uid &&
                  parent.fathers_uid !== "D00Z00001"
                ) {
                  generation = 4; // Could extend this logic further if needed
                }
              }
              maxGeneration = Math.max(maxGeneration, generation);
            }
          });
          newState.currentGeneration = maxGeneration;
          generationChanged = true;
        } else if (!areChildrenVisible) {
          // EXPAND: Children are not visible, so show them
          children.forEach((child) => {
            newState.visibleNodes.add(child.unique_id);
          });
          newState.expandedChildren.add(uid);

          // Track spouse assignment: Record that this spouse (uid) is responsible for these children
          if (!isDescendantNode && children.length > 0) {
            // Find the descendant partner whose children these are
            const descendantPartner = allMembers.find((m) => {
              const memberSpouses = findSpouses(m, allMembers);
              return memberSpouses.some((spouse) => spouse.unique_id === uid);
            });

            if (descendantPartner) {
              newState.spouseAssignments.set(descendantPartner.unique_id, uid);

              // Accordion behavior: collapse any other spouses' children for this same partner
              const otherSpouses = findSpouses(
                descendantPartner,
                allMembers
              ).filter((s) => s.unique_id !== uid);
              otherSpouses.forEach((other) => {
                if (newState.expandedChildren.has(other.unique_id)) {
                  // Collapse other spouse's children and descendants
                  collapseDescendantsRecursively(other.unique_id, newState);
                  newState.expandedChildren.delete(other.unique_id);
                }
              });
            }
          }

          // Don't automatically reveal spouses - let them be revealed progressively by clicking each child

          // Advance the generation when children are revealed
          newState.currentGeneration += 1;
          generationChanged = true;
        }
      }

      // Only update state if there were actual changes
      const hasChanges =
        newState.visibleNodes.size !== treeState.visibleNodes.size ||
        newState.expandedSpouses.size !== treeState.expandedSpouses.size ||
        newState.expandedChildren.size !== treeState.expandedChildren.size ||
        generationChanged;

      if (!hasChanges) {
        // No changes needed, don't update state
        return;
      }

      setTreeState({
        visibleNodes: newState.visibleNodes,
        expandedSpouses: newState.expandedSpouses,
        expandedChildren: newState.expandedChildren,
        spouseAssignments: newState.spouseAssignments,
        currentGeneration: newState.currentGeneration,
        lastClickedNodeId: uid,
      });
    },
    [allMembers, treeState, collapseDescendantsRecursively]
  );

  // Reset to initial view
  const resetTree = useCallback(() => {
    // if (allMembers.length > 0) {
    //   const initialState = createInitialTreeState(allMembers);
    //   setTreeState(initialState);
    // }
    window.location.reload();
  }, [allMembers]);

  // Tree configuration
  const treeConfig = {
    orientation: "vertical" as const,
    pathFunc: "step" as const,
    translate: { x: 400, y: 150 }, // Adjusted for larger nodes
    nodeSize: { x: 250, y: 280 },
    separation: { siblings: 1.2, nonSiblings: 1.5 },
    zoom: 0.7,
  };

  // Apply dotted style for out-of-wedlock links
  const pathClassFunc = useCallback((linkDatum: any) => {
    const sourceAttrs = linkDatum?.source?.data?.attributes;
    const targetAttrs = linkDatum?.target?.data?.attributes;
    // Apply dotted style only when the link originates from the correct parent for OW cases
    if (
      targetAttrs?.is_out_of_wedlock &&
      targetAttrs?.ow_source &&
      sourceAttrs
    ) {
      if (
        (targetAttrs.ow_source === "father" &&
          sourceAttrs?.gender?.toLowerCase() === "male") ||
        (targetAttrs.ow_source === "mother" &&
          sourceAttrs?.gender?.toLowerCase() === "female")
      ) {
        return "ow-link";
      }
    }
    return "";
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading family tree...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <span>Error Loading Family Tree</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadFamilyData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!treeData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No family tree data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Family Tree</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* <Badge variant="secondary">
              Generation {treeState?.currentGeneration || 1}
            </Badge> */}
            <Button onClick={resetTree} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset View
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Progressive disclosure: Click males (squares) to reveal spouses. For
          monogamous males, spouse and children appear together. For polygamous
          families, click spouses (circles) to expand children.
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[800px] border rounded-lg bg-gradient-to-b from-blue-50 to-white">
          <Tree
            data={treeData}
            orientation={treeConfig.orientation}
            pathFunc={customPathFunc}
            pathClassFunc={pathClassFunc}
            translate={treeConfig.translate}
            nodeSize={treeConfig.nodeSize}
            separation={treeConfig.separation}
            zoom={treeConfig.zoom}
            renderCustomNodeElement={(nodeProps) => (
              <FamilyTreeNode
                {...nodeProps}
                onNodeClick={() => handleNodeClick(nodeProps.nodeDatum)}
              />
            )}
            enableLegacyTransitions={true}
            shouldCollapseNeighborNodes={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyTreeComponent;

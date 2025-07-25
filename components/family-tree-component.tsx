"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Tree, { TreeNodeDatum, CustomNodeElementProps } from "react-d3-tree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Users, Heart } from "lucide-react";
import { ProcessedMember } from "@/lib/types";
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
  const nodeWidth = 120;
  const nodeHeight = 140;
  const imageSize = 60;

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

  const nameY = -nodeHeight / 2 + (nameLines.length > 1 ? 78 : 85);
  const uidY = -nodeHeight / 2 + (nameLines.length > 1 ? 105 : 100);

  return (
    <g onClick={onNodeClick}>
      {/* Main node rectangle */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        fill={backgroundColor}
        stroke="#374151"
        strokeWidth={2}
        rx={8}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      />

      {/* Profile image placeholder */}
      {gender?.toLowerCase() === "female" ? (
        <circle
          cx={0}
          cy={-nodeHeight / 2 + 10 + imageSize / 2}
          r={imageSize / 2}
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth={1}
        />
      ) : (
        <rect
          width={imageSize}
          height={imageSize}
          x={-imageSize / 2}
          y={-nodeHeight / 2 + 10}
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth={1}
          rx={8}
        />
      )}

      {/* If we have an image, we'd add it here */}
      {attributes?.picture_link ? (
        <image
          href={attributes.picture_link}
          width={imageSize}
          height={imageSize}
          x={-imageSize / 2}
          y={-nodeHeight / 2 + 10}
          clipPath={`url(#imageClip-${attributes?.unique_id || "node"})`}
        />
      ) : null}

      {/* Name text */}
      <text
        x={0}
        y={nameY}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="600"
      >
        {nameLines.map((line, index) => (
          <tspan x={0} key={index} dy={index === 0 ? 0 : "1.2em"}>
            {line}
          </tspan>
        ))}
      </text>

      {/* UID text */}
      <text
        x={0}
        y={uidY}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        opacity={0.8}
      >
        {attributes?.unique_id}
      </text>

      {/* Click indicator for nodes with children */}
      {hasChildren && (
        <circle
          cx={nodeWidth / 2 - 10}
          cy={-nodeHeight / 2 + 10}
          r={8}
          fill="#10B981"
          stroke="white"
          strokeWidth={2}
        />
      )}

      {/* Plus icon for clickable nodes */}
      {hasChildren && (
        <text
          x={nodeWidth / 2 - 10}
          y={-nodeHeight / 2 + 15}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          +
        </text>
      )}

      {/* Polygamous marriage indicator */}
      {attributes?.spouse_count && attributes.spouse_count > 1 && (
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
      )}

      {/* Define clip path for circular images */}
      <defs>
        <clipPath id={`imageClip-${attributes?.unique_id || "node"}`}>
          {gender?.toLowerCase() === "female" ? (
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

  // Handle node clicks for progressive disclosure
  const handleNodeClick = useCallback(
    (nodeDatum: TreeNodeDatum) => {
      const attributes = nodeDatum.attributes as TreeNode["attributes"];
      const uid = attributes?.unique_id;

      if (!uid || !treeState || !allMembers.length) return;

      // Special handling for the root node if needed
      if (uid === "COUPLE_ROOT") {
        // You might want to implement logic to expand the whole tree or something similar
        return;
      }

      const member = allMembers.find((m) => m.unique_id === uid);
      if (!member) return;

      const newState = { ...treeState };
      const spouses = findSpouses(member, allMembers);
      const children = findChildren(member, allMembers);

      // Determine if the clicked node is a descendant or a spouse
      const isDescendantNode = isDescendant(uid);

      // Check if the click is on a Gen 2 family member (descendant or their spouse)
      // This will determine if the children to be revealed are Gen 3.
      const partner = isSpouse(member.unique_id)
        ? allMembers.find((p) => p.unique_id === member.spouse_uid)
        : member;
      const isGen2FamilyClick =
        partner &&
        (partner.fathers_uid === "D00Z00001" ||
          partner.mothers_uid === "S00Z00001");

      // If a descendant is clicked, reveal their spouse(s)
      if (isDescendantNode && spouses.length > 0) {
        if (!newState.expandedSpouses.has(uid)) {
          spouses.forEach((spouse) => {
            newState.visibleNodes.add(spouse.unique_id);
          });
          newState.expandedSpouses.add(uid);
        }
      }
      // If a node (descendant or spouse) with children is clicked, reveal them
      else if (children.length > 0) {
        // This check prevents re-adding children if they are already visible
        const areChildrenVisible = children.every((child) =>
          newState.visibleNodes.has(child.unique_id)
        );

        if (!areChildrenVisible) {
          children.forEach((child) => {
            newState.visibleNodes.add(child.unique_id);
          });

          // If we just revealed Gen 3, also reveal their spouses automatically.
          if (isGen2FamilyClick) {
            children.forEach((child) => {
              const childSpouses = findSpouses(child, allMembers);
              if (childSpouses.length > 0) {
                newState.expandedSpouses.add(child.unique_id);
                childSpouses.forEach((spouse) => {
                  newState.visibleNodes.add(spouse.unique_id);
                });
              }
            });
          }

          // We can advance the generation when children are revealed
          newState.currentGeneration += 1;
        }
      }

      setTreeState({
        visibleNodes: new Set(newState.visibleNodes),
        expandedSpouses: new Set(newState.expandedSpouses),
        currentGeneration: newState.currentGeneration,
        lastClickedNodeId: uid,
      });
    },
    [allMembers, treeState]
  );

  // Reset to initial view
  const resetTree = useCallback(() => {
    if (allMembers.length > 0) {
      const initialState = createInitialTreeState(allMembers);
      setTreeState(initialState);
    }
  }, [allMembers]);

  // Tree configuration
  const treeConfig = {
    orientation: "vertical" as const,
    pathFunc: "step" as const,
    translate: { x: 400, y: 100 },
    nodeSize: { x: 200, y: 200 },
    separation: { siblings: 1.5, nonSiblings: 2 },
    zoom: 0.8,
  };

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
            <Badge variant="secondary">
              Generation {treeState?.currentGeneration || 1}
            </Badge>
            <Button onClick={resetTree} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset View
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Click on descendants to reveal spouses, click on spouses to reveal
          children
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[800px] border rounded-lg bg-gradient-to-b from-blue-50 to-white">
          <Tree
            data={treeData}
            orientation={treeConfig.orientation}
            pathFunc={customPathFunc}
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

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Color Legend</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.origin }}
              />
              <span>Origin Couple</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.red }}
              />
              <span>First Descendant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.green }}
              />
              <span>First Male Child</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.blue }}
              />
              <span>Second Male Child</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.purple }}
              />
              <span>Third Male Child</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LINEAGE_COLORS.neutral }}
              />
              <span>Spouses & Females</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyTreeComponent;

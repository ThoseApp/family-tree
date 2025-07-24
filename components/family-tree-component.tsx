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
} from "@/lib/utils/family-tree-d3-helpers";

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
        rx={12}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      />

      {/* Profile image placeholder */}
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

      {/* If we have an image, we'd add it here */}
      {attributes?.picture_link ? (
        <image
          href={attributes.picture_link}
          width={imageSize}
          height={imageSize}
          x={-imageSize / 2}
          y={-nodeHeight / 2 + 10}
          clipPath="url(#imageClip)"
        />
      ) : (
        <text
          x={0}
          y={-nodeHeight / 2 + 45}
          textAnchor="middle"
          fill="#6B7280"
          fontSize="24"
        >
          👤
        </text>
      )}

      {/* Name text */}
      <text
        x={0}
        y={-nodeHeight / 2 + 85}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="600"
      >
        {nodeDatum.name.length > 15
          ? `${nodeDatum.name.substring(0, 15)}...`
          : nodeDatum.name}
      </text>

      {/* UID text */}
      <text
        x={0}
        y={-nodeHeight / 2 + 100}
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

      {/* Spouse indicator */}
      {isSpouseNode && (
        <text
          x={-nodeWidth / 2 + 10}
          y={-nodeHeight / 2 + 15}
          textAnchor="middle"
          fill="white"
          fontSize="12"
        >
          💕
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
          {attributes.spouse_count}👥
        </text>
      )}

      {/* Define clip path for circular images */}
      <defs>
        <clipPath id="imageClip">
          <rect
            width={imageSize}
            height={imageSize}
            x={-imageSize / 2}
            y={-nodeHeight / 2 + 10}
            rx={8}
          />
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

      const member = allMembers.find((m) => m.unique_id === uid);
      if (!member) return;

      const newState = { ...treeState };
      const spouses = findSpouses(member, allMembers);
      const children = findChildren(member, allMembers);

      // If this is a descendant click, show spouses
      if (isDescendant(uid) && spouses.length > 0) {
        if (!newState.expandedSpouses.has(uid)) {
          // Show spouses
          spouses.forEach((spouse) => {
            newState.visibleNodes.add(spouse.unique_id);
          });
          newState.expandedSpouses.add(uid);
          setTreeState({
            visibleNodes: new Set(newState.visibleNodes),
            expandedSpouses: new Set(newState.expandedSpouses),
            currentGeneration: newState.currentGeneration,
          });
        }
      }

      // If this is a spouse click, show children
      else if (attributes?.is_spouse && children.length > 0) {
        if (!newState.expandedSpouses.has(uid)) {
          // Show children and their spouses
          children.forEach((child) => {
            newState.visibleNodes.add(child.unique_id);
            const childSpouses = findSpouses(child, allMembers);
            childSpouses.forEach((spouse) => {
              newState.visibleNodes.add(spouse.unique_id);
            });
          });
          newState.expandedSpouses.add(uid);
          newState.currentGeneration += 1;
          setTreeState({
            visibleNodes: new Set(newState.visibleNodes),
            expandedSpouses: new Set(newState.expandedSpouses),
            currentGeneration: newState.currentGeneration,
          });
        }
      }
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
            pathFunc={treeConfig.pathFunc}
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

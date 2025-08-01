import { ProcessedMember } from "@/lib/types";

// Color system for different lineages
export const LINEAGE_COLORS = {
  neutral: "#94A3B8", // slate-400 for spouses and females
  origin: "#78716C", // stone-500 for origin couple
  red: "#ea9c36", // red-500 for D01Z00002 lineage
  green: "#10B981", // emerald-500 for first male child
  blue: "#3B82F6", // blue-500 for second male child
  purple: "#8B5CF6", // violet-500 for third male child
  yellow: "#F59E0B", // amber-500 for female children
} as const;

export type LineageColor = keyof typeof LINEAGE_COLORS;

// react-d3-tree node structure
export interface TreeNode {
  name: string;
  attributes?: {
    unique_id: string;
    gender: string;
    picture_link?: string;
    lineage_color: LineageColor;
    order_of_birth?: number;
    order_of_marriage?: number;
    marital_status?: string;
    is_spouse?: boolean;
    is_descendant?: boolean;
    has_children?: boolean;
    spouse_count?: number;
  };
  children?: TreeNode[];
}

// Family tree state for progressive disclosure
export interface FamilyTreeState {
  visibleNodes: Set<string>; // UIDs of visible nodes
  expandedSpouses: Set<string>; // UIDs of members whose spouses are shown
  expandedChildren: Set<string>; // UIDs of members whose children are shown
  spouseAssignments: Map<string, string>; // Maps descendant UID to spouse UID that currently has their children
  currentGeneration: number;
  lastClickedNodeId?: string;
}

/**
 * Determine lineage color based on family position and gender
 */
export function determineLineageColor(
  member: ProcessedMember,
  allMembers: ProcessedMember[]
): LineageColor {
  const {
    unique_id,
    gender,
    fathers_uid,
    fathers_first_name,
    fathers_last_name,
    order_of_birth,
  } = member;

  // Origin couple
  if (unique_id === "D00Z00001" || unique_id === "S00Z00001") {
    return "origin";
  }

  // Spouses are always neutral (except the origin princess)
  if (isSpouse(unique_id)) {
    return "neutral";
  }

  // Egundebi (D01Z00002) is the start of the red lineage
  if (unique_id === "D01Z00002") {
    return "red";
  }

  // Check if the member is a child of Egundebi (D01Z00002)
  if (fathers_uid === "D01Z00002") {
    if (gender?.toLowerCase() === "male") {
      if (order_of_birth === 1) return "green";
      if (order_of_birth === 2) return "blue";
      if (order_of_birth === 3) return "purple";
    }
    if (gender?.toLowerCase() === "female") {
      return "yellow";
    }
  }

  // For other descendants, they inherit their father's color.
  // First try to find father by UID
  if (fathers_uid) {
    const father = allMembers.find((m) => m.unique_id === fathers_uid);
    if (father) {
      // Recursive call to find the father's lineage color.
      const inheritedColor = determineLineageColor(father, allMembers);
      return inheritedColor;
    }
  }

  // Fallback: Try to find father by name if UID is not available
  if (fathers_first_name && fathers_last_name) {
    const father = allMembers.find(
      (m) =>
        m.first_name?.toLowerCase().trim() ===
          fathers_first_name.toLowerCase().trim() &&
        m.last_name?.toLowerCase().trim() ===
          fathers_last_name.toLowerCase().trim()
    );
    if (father) {
      // Recursive call to find the father's lineage color.
      const inheritedColor = determineLineageColor(father, allMembers);
      return inheritedColor;
    }
  }

  // Default color for any other case (e.g., females not in a special group)
  return "neutral";
}

/**
 * Check if a member is a descendant (starts with 'D')
 */
export function isDescendant(uid: string): boolean {
  return uid.startsWith("D");
}

/**
 * Check if a member is a spouse (starts with 'S')
 */
export function isSpouse(uid: string): boolean {
  return uid.startsWith("S");
}

/**
 * Validate color inheritance consistency for debugging
 */
export function validateColorInheritance(allMembers: ProcessedMember[]): {
  [key: string]: string;
} {
  const colorMap: { [key: string]: string } = {};
  const inheritanceIssues: string[] = [];
  const neutralDescendants: string[] = [];

  allMembers.forEach((member) => {
    const color = determineLineageColor(member, allMembers);
    colorMap[member.unique_id] = color;

    // Track descendants that are neutral (potential issues)
    if (
      isDescendant(member.unique_id) &&
      color === "neutral" &&
      !isSpouse(member.unique_id)
    ) {
      neutralDescendants.push(
        `${member.unique_id} (${member.first_name} ${member.last_name})`
      );
    }

    // Check for inheritance consistency
    if (!isSpouse(member.unique_id)) {
      let father: ProcessedMember | undefined;

      // Try to find father by UID first
      if (member.fathers_uid) {
        father = allMembers.find((m) => m.unique_id === member.fathers_uid);
      }

      // Fallback to name-based lookup
      if (!father && member.fathers_first_name && member.fathers_last_name) {
        father = allMembers.find(
          (m) =>
            m.first_name?.toLowerCase().trim() ===
              member.fathers_first_name.toLowerCase().trim() &&
            m.last_name?.toLowerCase().trim() ===
              member.fathers_last_name.toLowerCase().trim()
        );
      }

      if (father) {
        const fatherColor = determineLineageColor(father, allMembers);

        // Skip special cases (origin, Egundebi, and his direct children)
        const isSpecialCase =
          member.unique_id === "D00Z00001" ||
          member.unique_id === "S00Z00001" ||
          member.unique_id === "D01Z00002" ||
          member.fathers_uid === "D01Z00002";

        if (!isSpecialCase && color !== fatherColor) {
          inheritanceIssues.push(
            `${member.unique_id} (${member.first_name} ${member.last_name}) has color ${color} but father ${father.unique_id} (${father.first_name} ${father.last_name}) has color ${fatherColor}`
          );
        }
      } else if (isDescendant(member.unique_id)) {
        // Skip special cases for missing father reports too
        const isSpecialCase =
          member.unique_id === "D00Z00001" ||
          member.unique_id === "S00Z00001" ||
          member.unique_id === "D01Z00002" ||
          member.fathers_uid === "D01Z00002";

        if (!isSpecialCase) {
          // Report missing father relationships
          inheritanceIssues.push(
            `${member.unique_id} (${member.first_name} ${member.last_name}) - No father found (UID: ${member.fathers_uid}, Name: ${member.fathers_first_name} ${member.fathers_last_name})`
          );
        }
      }
    }
  });

  if (inheritanceIssues.length > 0) {
    console.warn("Color inheritance issues found:", inheritanceIssues);
  }

  if (neutralDescendants.length > 0) {
    console.warn(
      "Descendants with neutral color (potential inheritance issues):",
      neutralDescendants
    );
  }

  return colorMap;
}

/**
 * Find all spouses of a given member
 */
export function findSpouses(
  member: ProcessedMember,
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  const spouses: ProcessedMember[] = [];

  // Find spouses by spouse_uid reference
  if (member.spouse_uid) {
    const spouse = allMembers.find((m) => m.unique_id === member.spouse_uid);
    if (spouse) spouses.push(spouse);
  }

  // Also find members who list this person as their spouse
  const otherSpouses = allMembers.filter(
    (m) => m.spouse_uid === member.unique_id
  );
  spouses.push(...otherSpouses);

  // Remove duplicates
  return spouses.filter(
    (spouse, index, arr) =>
      arr.findIndex((s) => s.unique_id === spouse.unique_id) === index
  );
}

/**
 * Find all children of a given member (or couple)
 */
export function findChildren(
  member: ProcessedMember,
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  const children: ProcessedMember[] = [];

  // Find children where this member is the father
  if (member.gender?.toLowerCase() === "male") {
    const fatherChildren = allMembers.filter(
      (m) => m.fathers_uid === member.unique_id
    );
    children.push(...fatherChildren);
  }

  // Find children where this member is the mother
  if (member.gender?.toLowerCase() === "female") {
    const motherChildren = allMembers.filter(
      (m) => m.mothers_uid === member.unique_id
    );
    children.push(...motherChildren);
  }

  // Remove duplicates and sort by order of birth
  const uniqueChildren = children.filter(
    (child, index, arr) =>
      arr.findIndex((c) => c.unique_id === child.unique_id) === index
  );

  return uniqueChildren.sort(
    (a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0)
  );
}

/**
 * Convert ProcessedMember to TreeNode for react-d3-tree
 */
export function convertToTreeNode(
  member: ProcessedMember,
  allMembers: ProcessedMember[],
  state: FamilyTreeState
): TreeNode {
  const lineageColor = determineLineageColor(member, allMembers);
  const spouses = findSpouses(member, allMembers);
  const children = findChildren(member, allMembers);

  // Validate color inheritance for debugging (only in development)
  if (process.env.NODE_ENV === "development" && !isSpouse(member.unique_id)) {
    let father: ProcessedMember | undefined;

    // Try to find father by UID first
    if (member.fathers_uid) {
      father = allMembers.find((m) => m.unique_id === member.fathers_uid);
    }

    // Fallback to name-based lookup
    if (!father && member.fathers_first_name && member.fathers_last_name) {
      father = allMembers.find(
        (m) =>
          m.first_name?.toLowerCase().trim() ===
            member.fathers_first_name.toLowerCase().trim() &&
          m.last_name?.toLowerCase().trim() ===
            member.fathers_last_name.toLowerCase().trim()
      );
    }

    if (father) {
      const fatherColor = determineLineageColor(father, allMembers);
      const isSpecialCase =
        member.unique_id === "D00Z00001" ||
        member.unique_id === "S00Z00001" ||
        member.unique_id === "D01Z00002" ||
        member.fathers_uid === "D01Z00002";

      if (!isSpecialCase && lineageColor !== fatherColor) {
        console.warn(
          `Color inheritance issue: ${member.unique_id} (${member.first_name} ${member.last_name}) has color ${lineageColor} but should inherit ${fatherColor} from father ${father.unique_id} (${father.first_name} ${father.last_name})`
        );
      }
    }
  }

  const node: TreeNode = {
    name: `${member.first_name} ${member.last_name}`.trim(),
    attributes: {
      unique_id: member.unique_id,
      gender: member.gender || "unknown",
      picture_link: member.picture_link,
      lineage_color: lineageColor,
      order_of_birth: member.order_of_birth || undefined,
      order_of_marriage: member.order_of_marriage || undefined,
      marital_status: member.marital_status,
      is_spouse: isSpouse(member.unique_id),
      is_descendant: isDescendant(member.unique_id),
      has_children: children.length > 0,
      spouse_count: spouses.length,
    },
  };

  // Don't automatically assign children here - let buildSubTree handle child assignment
  // This ensures children are properly routed through spouses according to family tree rules

  return node;
}

function buildSubTree(
  member: ProcessedMember,
  allMembers: ProcessedMember[],
  state: FamilyTreeState,
  parentSpouseContext?: string // Track which spouse pattern to follow down this branch
): TreeNode {
  // If this member's spouses are expanded and visible, create a family group.
  const spouses = findSpouses(member, allMembers).filter((s) =>
    state.visibleNodes.has(s.unique_id)
  );
  const shouldCreateFamilyGroup =
    state.expandedSpouses.has(member.unique_id) && spouses.length > 0;

  // The base node for the direct descendant.
  const memberNode = convertToTreeNode(member, allMembers, state);

  // Find and build subtrees for visible children.
  const visibleChildren = findChildren(member, allMembers)
    .filter((child) => state.visibleNodes.has(child.unique_id))
    .sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0));

  const childrenSubTrees = visibleChildren.map((child) =>
    buildSubTree(child, allMembers, state, parentSpouseContext)
  );

  if (shouldCreateFamilyGroup) {
    const familyGroupNode: TreeNode = {
      name: `${member.first_name}'s Family`,
      attributes: {
        unique_id: `FAMILY_${member.unique_id}`,
        gender: "family",
        lineage_color: determineLineageColor(member, allMembers),
      },
      children: [memberNode],
    };

    const spouseNodes = spouses.map((spouse) => {
      const spouseNode = convertToTreeNode(spouse, allMembers, state);
      spouseNode.children = []; // Initialize with no children
      return spouseNode;
    });

    familyGroupNode.children!.push(...spouseNodes);

    // Determine which spouse should have the children with consistent branching
    let targetSpouseNode = null;
    let selectedSpouseId = null;

    // Priority 1: Check existing spouse assignment for this descendant (maintains consistency)
    const existingAssignment = state.spouseAssignments.get(member.unique_id);
    if (existingAssignment) {
      targetSpouseNode = spouseNodes.find(
        (s) => s.attributes!.unique_id === existingAssignment
      );
      selectedSpouseId = existingAssignment;
    }

    // Priority 2: Use parentSpouseContext for consistency down the tree (new assignments)
    if (!targetSpouseNode && parentSpouseContext) {
      targetSpouseNode = spouseNodes.find(
        (s) => s.attributes!.unique_id === parentSpouseContext
      );
      selectedSpouseId = parentSpouseContext;
    }

    // Priority 3: Check if the last clicked node was one of the spouses (for new branches)
    if (!targetSpouseNode && state.lastClickedNodeId) {
      targetSpouseNode = spouseNodes.find(
        (s) => s.attributes!.unique_id === state.lastClickedNodeId
      );
      selectedSpouseId = state.lastClickedNodeId;
    }

    // Priority 4: If no specific spouse context, use first spouse and establish pattern
    if (!targetSpouseNode && spouseNodes.length > 0) {
      targetSpouseNode = spouseNodes[0];
      selectedSpouseId = spouseNodes[0].attributes!.unique_id;
    }

    // Attach children to the target spouse, not the descendant
    if (targetSpouseNode) {
      // Pass down the selected spouse ID as context for consistent branching down the tree
      const childrenWithContext = visibleChildren.map((child) =>
        buildSubTree(child, allMembers, state, selectedSpouseId || undefined)
      );
      targetSpouseNode.children = childrenWithContext;
      memberNode.children = []; // Remove children from descendant
    } else {
      // Should not happen due to our consistency rules, but keep for safety
      memberNode.children = [];
    }

    return familyGroupNode;
  }

  // CONSISTENCY RULE: Children should NEVER come directly from descendants
  // They must ALWAYS come from spouses to maintain tree branching consistency

  // If no family group (spouses not visible or don't exist), children are hidden
  // This enforces the spouse-first branching rule throughout the entire tree
  memberNode.children = [];

  return memberNode;
}

/**
 * Build the tree data structure for react-d3-tree with spouse support
 */
export function buildTreeData(
  allMembers: ProcessedMember[],
  state: FamilyTreeState
): TreeNode {
  const laketu = allMembers.find((m) => m.unique_id === "D00Z00001");
  const princess = allMembers.find((m) => m.unique_id === "S00Z00001");

  if (!laketu) {
    throw new Error("Origin member D00Z00001 (Laketu) not found");
  }

  const treeRoot: TreeNode = {
    name: "FamilyTreeRoot",
    attributes: {
      unique_id: "TREE_ROOT",
      gender: "family",
      lineage_color: "neutral",
    },
    children: [],
  };

  const originCoupleNode: TreeNode = {
    name: "Origin Couple",
    attributes: {
      unique_id: "COUPLE_ROOT",
      gender: "couple",
      lineage_color: "origin",
    },
    children: [],
  };

  treeRoot.children!.push(originCoupleNode);

  const laketuNode = convertToTreeNode(laketu, allMembers, state);
  laketuNode.children = [];
  originCoupleNode.children!.push(laketuNode);

  if (princess && state.visibleNodes.has(princess.unique_id)) {
    const princessNode = convertToTreeNode(princess, allMembers, state);
    princessNode.children = [];
    originCoupleNode.children!.push(princessNode);
  }

  const directChildren = findChildren(laketu, allMembers)
    .filter((child) => state.visibleNodes.has(child.unique_id))
    .sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0));

  // CONSISTENCY RULE: Children ALWAYS come from spouse (Princess), NEVER from descendant (Laketu)
  if (princess && state.visibleNodes.has(princess.unique_id)) {
    const princessNode = originCoupleNode.children!.find(
      (node) => node.attributes!.unique_id === "S00Z00001"
    );
    if (princessNode) {
      princessNode.children = directChildren.map(
        (child) => buildSubTree(child, allMembers, state, "S00Z00001") // Princess is the source spouse for origin children
      );
    }
  }
  // If Princess is not visible, children are NOT shown - maintains spouse-first branching consistency
  // This forces the proper flow: reveal Princess first, then children come from her

  return treeRoot;
}

/**
 * Initial tree state to show only the origin male (progressive disclosure)
 */
export function createInitialTreeState(
  allMembers: ProcessedMember[]
): FamilyTreeState {
  const visibleNodes = new Set<string>();
  const expandedSpouses = new Set<string>();
  const expandedChildren = new Set<string>();

  // Show only origin male initially - progressive disclosure starts here
  visibleNodes.add("D00Z00001"); // Laketu only

  return {
    visibleNodes,
    expandedSpouses,
    expandedChildren,
    spouseAssignments: new Map<string, string>(),
    currentGeneration: 1,
    lastClickedNodeId: undefined,
  };
}

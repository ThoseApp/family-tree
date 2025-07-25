import { ProcessedMember } from "@/lib/types";

// Color system for different lineages
export const LINEAGE_COLORS = {
  neutral: "#94A3B8", // slate-400 for spouses and females
  origin: "#78716C", // stone-500 for origin couple
  red: "#EF4444", // red-500 for D01Z00002 lineage
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
  const { unique_id, gender, fathers_uid, order_of_birth } = member;

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
  if (fathers_uid) {
    const father = allMembers.find((m) => m.unique_id === fathers_uid);
    if (father) {
      // Recursive call to find the father's lineage color.
      return determineLineageColor(father, allMembers);
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

  // Add children if they should be visible
  const visibleChildren = children.filter((child) =>
    state.visibleNodes.has(child.unique_id)
  );

  if (visibleChildren.length > 0) {
    node.children = visibleChildren.map((child) =>
      convertToTreeNode(child, allMembers, state)
    );
  }

  return node;
}

function buildSubTree(
  member: ProcessedMember,
  allMembers: ProcessedMember[],
  state: FamilyTreeState
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
    buildSubTree(child, allMembers, state)
  );

  // By default, children are attached to the descendant member.
  memberNode.children = childrenSubTrees;

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
      spouseNode.children = []; // Spouses do not carry their own descendant lines by default.
      return spouseNode;
    });

    familyGroupNode.children!.push(...spouseNodes);

    // If a spouse was clicked to reveal children, move the children to that spouse.
    const clickedSpouseNode = spouseNodes.find(
      (s) => s.attributes!.unique_id === state.lastClickedNodeId
    );

    if (clickedSpouseNode) {
      clickedSpouseNode.children = memberNode.children;
      memberNode.children = [];
    }

    return familyGroupNode;
  }

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

  laketuNode.children = directChildren.map((child) =>
    buildSubTree(child, allMembers, state)
  );

  return treeRoot;
}

/**
 * Enhanced initial tree state to show origin couple, first descendant, and spouses
 */
export function createInitialTreeState(
  allMembers: ProcessedMember[]
): FamilyTreeState {
  const visibleNodes = new Set<string>();
  const expandedSpouses = new Set<string>();

  // Always show origin couple
  visibleNodes.add("D00Z00001"); // Laketu
  visibleNodes.add("S00Z00001"); // Princess Olutoyese

  // Show first descendant
  const egundebi = allMembers.find((m) => m.unique_id === "D01Z00002");
  if (egundebi) {
    visibleNodes.add("D01Z00002"); // Egundebi

    // Show his spouse(s) - this matches the initial view in the images
    const spouses = findSpouses(egundebi, allMembers);
    spouses.forEach((spouse) => {
      visibleNodes.add(spouse.unique_id);
    });

    if (spouses.length > 0) {
      expandedSpouses.add("D01Z00002");
    }
  }

  return {
    visibleNodes,
    expandedSpouses,
    currentGeneration: 1,
    lastClickedNodeId: undefined,
  };
}

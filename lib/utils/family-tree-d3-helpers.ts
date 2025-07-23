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
}

/**
 * Determine lineage color based on family position and gender
 */
export function determineLineageColor(
  member: ProcessedMember,
  allMembers: ProcessedMember[]
): LineageColor {
  const uid = member.unique_id;

  // Origin couple
  if (uid === "D00Z00001" || uid === "S00Z00001") {
    return "origin";
  }

  // First descendant (D01Z00002) - red lineage
  if (uid === "D01Z00002") {
    return "red";
  }

  // Spouses always get neutral color
  if (uid.startsWith("S") && uid !== "S00Z00001") {
    return "neutral";
  }

  // Females get neutral color (except origin)
  if (member.gender?.toLowerCase() === "female") {
    return "neutral";
  }

  // For descendants, find their father and inherit lineage
  if (member.fathers_uid) {
    const father = allMembers.find((m) => m.unique_id === member.fathers_uid);
    if (father) {
      // If father is D01Z00002's child, assign based on order of birth
      if (father.fathers_uid === "D00Z00002") {
        const orderOfBirth = father.order_of_birth || 0;
        if (orderOfBirth === 1) return "green";
        if (orderOfBirth === 2) return "blue";
        if (orderOfBirth === 3) return "purple";
        return "neutral"; // Default for other children
      }

      // Otherwise inherit father's color
      return determineLineageColor(father, allMembers);
    }
  }

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

  return spouses;
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

/**
 * Build the tree data structure for react-d3-tree with spouse support
 */
export function buildTreeData(
  allMembers: ProcessedMember[],
  state: FamilyTreeState
): TreeNode {
  // Find the origin couple
  const laketu = allMembers.find((m) => m.unique_id === "D00Z00001");
  const princess = allMembers.find((m) => m.unique_id === "S00Z00001");

  if (!laketu) {
    throw new Error("Origin member D00Z00001 (Laketu) not found");
  }

  // Create a special root node that represents the couple
  const rootNode: TreeNode = {
    name: "Origin Family",
    attributes: {
      unique_id: "ROOT",
      gender: "couple",
      lineage_color: "origin",
      is_descendant: false,
      is_spouse: false,
      has_children: true,
      spouse_count: 0,
    },
    children: [],
  };

  // Add origin couple as horizontal siblings
  const laketusNode = convertToTreeNode(laketu, allMembers, state);
  if (princess && state.visibleNodes.has(princess.unique_id)) {
    const princessNode = convertToTreeNode(princess, allMembers, state);
    rootNode.children = [laketusNode, princessNode];
  } else {
    rootNode.children = [laketusNode];
  }

  // Add visible descendants as children of the origin couple
  const descendants = allMembers
    .filter(
      (m) =>
        m.fathers_uid === "D00Z00001" && state.visibleNodes.has(m.unique_id)
    )
    .sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0));

  if (descendants.length > 0) {
    // Create descendants with their spouses horizontally
    const descendantNodes = descendants.map((desc) => {
      const descendantNode = convertToTreeNode(desc, allMembers, state);

      // If spouses are expanded for this descendant, add them as siblings
      if (state.expandedSpouses.has(desc.unique_id)) {
        const spouses = findSpouses(desc, allMembers).filter((spouse) =>
          state.visibleNodes.has(spouse.unique_id)
        );

        if (spouses.length > 0) {
          // Create a family group node
          const familyGroupNode: TreeNode = {
            name: `${desc.first_name}'s Family`,
            attributes: {
              unique_id: `FAMILY_${desc.unique_id}`,
              gender: "family",
              lineage_color: determineLineageColor(desc, allMembers),
              is_descendant: false,
              is_spouse: false,
              has_children: descendantNode.children
                ? descendantNode.children.length > 0
                : false,
              spouse_count: spouses.length,
            },
            children: [],
          };

          // Add descendant and spouses as children (horizontal layout)
          familyGroupNode.children = [
            descendantNode,
            ...spouses.map((spouse) =>
              convertToTreeNode(spouse, allMembers, state)
            ),
          ];

          return familyGroupNode;
        }
      }

      return descendantNode;
    });

    // Add descendant nodes to the origin couple
    rootNode.children.push(...descendantNodes);
  }

  return rootNode;
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
  };
}

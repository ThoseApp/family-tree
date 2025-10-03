import { ProcessedMember } from "@/lib/types";

// Color system for different lineages
// Softer palette for better readability in the tree UI
export const LINEAGE_COLORS = {
  neutral: "#CBD5E1", // slate-300 for spouses and females
  origin: "#A8A29E", // stone-400 for origin couple
  red: "#FDA4AF", // rose-300 for D01Z00002 lineage
  green: "#A7F3D0", // emerald-200 for first male child
  blue: "#93C5FD", // blue-300 for second male child
  purple: "#C4B5FD", // violet-300 for third male child
  yellow: "#FDE68A", // amber-300 for female children
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
    // Added for styling/placement rules
    fathers_uid?: string;
    mothers_uid?: string;
    is_out_of_wedlock?: boolean;
    // For dotted-link origin determination
    ow_source?: "father" | "mother";
    // Multiple birth indicators
    is_multiple_birth?: boolean;
    multiple_birth_label?: string;
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

// Helper: treat placeholder strings as missing values
function isMissingUid(value?: string | null): boolean {
  if (value === undefined || value === null) return true;
  const v = String(value).trim().toLowerCase();
  return (
    v === "" ||
    v === "#n/a" ||
    v === "n/a" ||
    v === "na" ||
    v === "-" ||
    v === "null" ||
    v === "undefined"
  );
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

  // New color logic based on the 4th character of the unique_id
  if (unique_id.length >= 4) {
    const fourthChar = unique_id.charAt(3).toUpperCase();
    switch (fourthChar) {
      case "B":
        return "green";
      case "C":
        return "blue";
      case "D":
        return "yellow";
      case "A":
        return "purple";
      default:
        break; // Fall through to existing logic if no match
    }
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
  // Consider out-of-wedlock when father UID is known but mother UID is missing,
  // regardless of whether name placeholders exist for the mother.
  const isOutOfWedlock =
    (!isMissingUid(member.fathers_uid) && isMissingUid(member.mothers_uid)) ||
    (!isMissingUid(member.mothers_uid) && isMissingUid(member.fathers_uid));

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
      fathers_uid: member.fathers_uid,
      mothers_uid: member.mothers_uid,
      is_out_of_wedlock: isOutOfWedlock,
      ow_source:
        !isMissingUid(member.fathers_uid) && isMissingUid(member.mothers_uid)
          ? "father"
          : !isMissingUid(member.mothers_uid) &&
            isMissingUid(member.fathers_uid)
          ? "mother"
          : undefined,
      // Defaults for multiple birth badge
      is_multiple_birth: false,
      multiple_birth_label: undefined,
    },
  };

  // Detect twins/triplets: siblings with same mothers_uid and same order_of_birth
  if (!isMissingUid(member.mothers_uid) && member.order_of_birth != null) {
    const siblingsSameOrder = allMembers.filter(
      (m) =>
        m.unique_id !== member.unique_id &&
        m.mothers_uid === member.mothers_uid &&
        m.order_of_birth === member.order_of_birth
    );

    const multipleCount = siblingsSameOrder.length + 1; // include self
    if (multipleCount >= 2) {
      node.attributes!.is_multiple_birth = true;
      node.attributes!.multiple_birth_label =
        multipleCount === 2
          ? "Twins"
          : multipleCount === 3
          ? "Triplets"
          : "Multiples";
    }
  }

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
  // Sort spouses by ascending order_of_marriage for consistent display.
  const spouses = findSpouses(member, allMembers)
    .filter((s) => state.visibleNodes.has(s.unique_id))
    .sort(
      (a, b) =>
        (a.order_of_marriage ?? Infinity) - (b.order_of_marriage ?? Infinity)
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
        spouse_count: spouses.length,
      },
      children: [memberNode],
    };

    const spouseNodes = spouses.map((spouse) => {
      const spouseNode = convertToTreeNode(spouse, allMembers, state);
      spouseNode.children = []; // Initialize with no children
      return spouseNode;
    });

    familyGroupNode.children!.push(...spouseNodes);

    // Determine which spouse should have the in-wedlock children with consistent branching
    let targetSpouseNode: TreeNode | null = null;
    let selectedSpouseId: string | null = null;

    // Priority 1: Check existing spouse assignment for this descendant (maintains consistency)
    const existingAssignment = state.spouseAssignments.get(member.unique_id);
    if (existingAssignment) {
      const found = spouseNodes.find(
        (s) => s.attributes!.unique_id === existingAssignment
      );
      targetSpouseNode = found ?? null;
      selectedSpouseId = existingAssignment;
    }

    // Priority 2: Use parentSpouseContext for consistency down the tree (new assignments)
    if (!targetSpouseNode && parentSpouseContext) {
      const found = spouseNodes.find(
        (s) => s.attributes!.unique_id === parentSpouseContext
      );
      targetSpouseNode = found ?? null;
      selectedSpouseId = parentSpouseContext;
    }

    // Priority 3: Check if the last clicked node was one of the spouses (for new branches)
    if (!targetSpouseNode && state.lastClickedNodeId) {
      const found = spouseNodes.find(
        (s) => s.attributes!.unique_id === state.lastClickedNodeId
      );
      targetSpouseNode = found ?? null;
      selectedSpouseId = state.lastClickedNodeId;
    }

    // Priority 4: If no specific spouse context, use first spouse and establish pattern
    if (!targetSpouseNode && spouseNodes.length > 0) {
      targetSpouseNode = spouseNodes[0] ?? null;
      selectedSpouseId = spouseNodes[0]?.attributes!.unique_id ?? null;
    }

    // Split children into out-of-wedlock vs others (both father-known and mother-known)
    // Compute from the full children list (not only visible) so detection is accurate.
    const allChildren = findChildren(member, allMembers);
    const owChildrenFather = allChildren.filter(
      (child) =>
        !isMissingUid(child.fathers_uid) && isMissingUid(child.mothers_uid)
    );
    const owChildrenMother = allChildren.filter(
      (child) =>
        !isMissingUid(child.mothers_uid) && isMissingUid(child.fathers_uid)
    );
    const outOfWedlockChildren = [...owChildrenFather, ...owChildrenMother];

    const regularChildren = visibleChildren.filter(
      (child) =>
        !outOfWedlockChildren.some((ow) => ow.unique_id === child.unique_id)
    );

    // Get visible out-of-wedlock children and sort them by birth order
    const visibleOwChildrenFather = owChildrenFather.filter((child) =>
      state.visibleNodes.has(child.unique_id)
    );
    const visibleOwChildrenMother = owChildrenMother.filter((child) =>
      state.visibleNodes.has(child.unique_id)
    );

    // Attach children based on family type, maintaining birth order for all children
    if (targetSpouseNode) {
      const regularChildrenWithContext = regularChildren.map((child) =>
        buildSubTree(child, allMembers, state, selectedSpouseId || undefined)
      );

      // For monogamous families, attach children to the descendant for proper lineage visualization
      if (spouses.length === 1) {
        // Combine regular children and father-known OW children, sort by birth order
        const fatherOwChildrenWithContext = visibleOwChildrenFather.map(
          (child) => buildSubTree(child, allMembers, state, undefined)
        );

        // Combine and sort all children that should be attached to the descendant
        const allDescendantChildren = [
          ...regularChildren,
          ...visibleOwChildrenFather,
        ];
        const sortedDescendantChildren = allDescendantChildren
          .sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0))
          .map((child) => {
            // Check if this child is out-of-wedlock
            const isOw = visibleOwChildrenFather.some(
              (ow) => ow.unique_id === child.unique_id
            );
            return isOw
              ? buildSubTree(child, allMembers, state, undefined)
              : buildSubTree(
                  child,
                  allMembers,
                  state,
                  selectedSpouseId || undefined
                );
          });

        memberNode.children = [
          ...(memberNode.children || []),
          ...sortedDescendantChildren,
        ];
        // Keep spouse node without children for monogamous families
        targetSpouseNode.children = [];
      } else {
        // For polygamous families, maintain original behavior (children from spouse)
        targetSpouseNode.children = regularChildrenWithContext;
      }
    }

    // Attach OUT-OF-WEDLOCK children to the correct parent node with dotted links.
    // Make them visible whenever the spouse group is expanded (family group open),
    // not only when a particular spouse's children are expanded. This ensures OW
    // children are discoverable even if a spouse has no regular children.
    if (shouldCreateFamilyGroup) {
      // For polygamous families, father-known OW children still need to be attached to father
      if (spouses.length > 1 && visibleOwChildrenFather.length > 0) {
        const owChildrenForFather = visibleOwChildrenFather.map((child) =>
          buildSubTree(child, allMembers, state, undefined)
        );
        memberNode.children = [
          ...(memberNode.children || []),
          ...owChildrenForFather,
        ];
      }

      // Mother-known, father-missing → attach under the correct mother spouse node
      if (visibleOwChildrenMother.length > 0 && spouseNodes.length > 0) {
        // Group children by mothers_uid to attach to the right spouse node
        const byMother: Record<string, ProcessedMember[]> = {};
        visibleOwChildrenMother.forEach((child) => {
          const mid = child.mothers_uid || "";
          if (!byMother[mid]) byMother[mid] = [];
          byMother[mid].push(child);
        });

        Object.entries(byMother).forEach(([motherUid, childrenList]) => {
          if (!motherUid) return;
          const targetMotherNode = spouseNodes.find(
            (sp) => sp.attributes!.unique_id === motherUid
          );
          if (targetMotherNode) {
            // Get existing regular children for this spouse (if any)
            const existingChildren = targetMotherNode.children || [];

            // Build OW children
            const owChildrenBuilt = childrenList.map((child) =>
              buildSubTree(child, allMembers, state, undefined)
            );

            // Combine existing regular children with OW children and sort by birth order
            const allSpouseChildren = [
              ...regularChildren.filter((child) => {
                // Find regular children that belong to this spouse
                return child.mothers_uid === motherUid;
              }),
              ...childrenList,
            ].sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0));

            // Rebuild all children for this spouse in correct order
            const sortedSpouseChildren = allSpouseChildren.map((child) => {
              const isOw = childrenList.some(
                (ow) => ow.unique_id === child.unique_id
              );
              return isOw
                ? buildSubTree(child, allMembers, state, undefined)
                : buildSubTree(
                    child,
                    allMembers,
                    state,
                    selectedSpouseId || undefined
                  );
            });

            targetMotherNode.children = sortedSpouseChildren;
          }
        });
      }
    }

    // Children should never be attached directly to the descendant node
    // EXCEPTION: out-of-wedlock children are attached to the father so links originate from him.
    if (!memberNode.children) {
      memberNode.children = [];
    }

    return familyGroupNode;
  }

  // CONSISTENCY RULE: Children should NEVER come directly from descendants
  // They must ALWAYS come from spouses to maintain tree branching consistency
  // EXCEPTION: If a descendant has no spouses but has children, show the children directly

  // Check if this descendant has children but no spouses
  const hasChildren = visibleChildren.length > 0;
  const hasNoSpouses = spouses.length === 0;

  if (hasChildren && hasNoSpouses) {
    // For single parent families (no spouse), attach children directly to the descendant
    // Also handle out-of-wedlock children for single parents
    const allChildren = findChildren(member, allMembers);
    const owChildrenFatherSingle = allChildren.filter(
      (child: ProcessedMember) =>
        !isMissingUid(child.fathers_uid) &&
        isMissingUid(child.mothers_uid) &&
        state.visibleNodes.has(child.unique_id)
    );
    const owChildrenMotherSingle = allChildren.filter(
      (child: ProcessedMember) =>
        !isMissingUid(child.mothers_uid) &&
        isMissingUid(child.fathers_uid) &&
        state.visibleNodes.has(child.unique_id)
    );
    const singleParentOwChildren = [
      ...owChildrenFatherSingle,
      ...owChildrenMotherSingle,
    ];

    // Combine regular children and out-of-wedlock children, sort by birth order
    const allSingleParentChildren = [
      ...visibleChildren,
      ...singleParentOwChildren,
    ];
    const sortedSingleParentChildren = allSingleParentChildren
      .sort((a, b) => (a.order_of_birth || 0) - (b.order_of_birth || 0))
      .map((child) => buildSubTree(child, allMembers, state, undefined));

    memberNode.children = sortedSingleParentChildren;
  } else {
    // If no family group (spouses not visible or don't exist) and no children, hide children
    // This enforces the spouse-first branching rule for families with spouses
    memberNode.children = [];
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

  // CONSISTENCY RULE: For origin couple (monogamous), children come from descendant (Laketu)
  // This matches the behavior of other monogamous families in the tree
  if (princess && state.visibleNodes.has(princess.unique_id)) {
    const laketuNode = originCoupleNode.children!.find(
      (node) => node.attributes!.unique_id === "D00Z00001"
    );
    if (laketuNode) {
      laketuNode.children = directChildren.map(
        (child) => buildSubTree(child, allMembers, state, "S00Z00001") // Princess context for consistency
      );
    }
  }
  // If Princess is not visible, children are NOT shown - maintains progressive disclosure

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

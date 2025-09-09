import PageHeader from "@/components/page-header";
import FamilyTreeVisualization from "@/components/family-tree-visualization";
import React from "react";
import FamilyTreeComponent from "@/components/family-tree-component";

const FamilyTreePage = () => {
  return (
    <div>
      {/* HEADER SECTION */}
      <PageHeader
        title="Our Family Legacy"
        description="Explore the roots of our family, trace our lineage, and celebrate the connections that bind us together."
        searchBar
      />

      {/* FAMILY TREE VISUALIZATION */}
      <div className="container mx-auto p-6">
        <FamilyTreeComponent />
      </div>
    </div>
  );
};

export default FamilyTreePage;

import PageHeader from "@/components/page-header";
import React from "react";

const FamilyTreePage = () => {
  return (
    <div>
      {/* HEADER SECTION */}
      <PageHeader
        title="Our Family Legacy"
        description="Explore the roots of our family, trace our lineage, and celebrate the connections that bind us together."
        searchBar
      />
    </div>
  );
};

export default FamilyTreePage;

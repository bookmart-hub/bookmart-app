import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const CompetitiveExamsScreen = () => {
  const data = CATEGORY_DATA["CompetitiveExams"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default CompetitiveExamsScreen;

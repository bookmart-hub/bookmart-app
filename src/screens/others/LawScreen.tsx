import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const LawScreen = () => {
  const data = CATEGORY_DATA["Law"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default LawScreen;

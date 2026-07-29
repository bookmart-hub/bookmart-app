import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const ScinceFinctionScreen = () => {
  const data = CATEGORY_DATA["ScinceFinction"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default ScinceFinctionScreen;

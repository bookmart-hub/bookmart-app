import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const RomanceScreen = () => {
  const data = CATEGORY_DATA["Romance"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default RomanceScreen;

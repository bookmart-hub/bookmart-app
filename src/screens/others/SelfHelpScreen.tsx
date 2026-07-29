import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const SelfHelpScreen = () => {
  const data = CATEGORY_DATA["SelfHelp"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default SelfHelpScreen;

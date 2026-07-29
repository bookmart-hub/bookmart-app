import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const EngineeringScreen = () => {
  const data = CATEGORY_DATA["Engineering"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default EngineeringScreen;

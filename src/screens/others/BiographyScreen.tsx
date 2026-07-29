import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const BiographyScreen = () => {
  const data = CATEGORY_DATA["Biography"];
  console.log(data.items);
  return <CategoryMasonryLayout data={data.items} />;
};

export default BiographyScreen;

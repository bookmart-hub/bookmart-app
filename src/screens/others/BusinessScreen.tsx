import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const BusinessScreen = () => {
  const data = CATEGORY_DATA["Business"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default BusinessScreen;

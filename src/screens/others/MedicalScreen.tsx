import CategoryMasonryLayout from "@/components/ui/CategoryMasonryLayout";
import { CATEGORY_DATA } from "@/data/categoryMockData";
import React from "react";

const MedicalScreen = () => {
  const data = CATEGORY_DATA["Medical"];
  return <CategoryMasonryLayout data={data.items} />;
};

export default MedicalScreen;

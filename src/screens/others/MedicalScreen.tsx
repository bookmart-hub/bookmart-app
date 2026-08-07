import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const MedicalScreen = () => {
  const data = GENRE_DATA["Medical"];
  return <GenreMasonryLayout data={data.items} />;
};

export default MedicalScreen;

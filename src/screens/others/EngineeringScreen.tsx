import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const EngineeringScreen = () => {
  const data = GENRE_DATA["Engineering"];
  return <GenreMasonryLayout data={data.items} />;
};

export default EngineeringScreen;

import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const BiographyScreen = () => {
  const data = GENRE_DATA["Biography"];
  console.log(data.items);
  return <GenreMasonryLayout data={data.items} />;
};

export default BiographyScreen;

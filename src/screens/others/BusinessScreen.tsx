import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const BusinessScreen = () => {
  const data = GENRE_DATA["Business"];
  return <GenreMasonryLayout data={data.items} />;
};

export default BusinessScreen;

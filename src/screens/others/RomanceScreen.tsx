import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const RomanceScreen = () => {
  const data = GENRE_DATA["Romance"];
  return <GenreMasonryLayout data={data.items} />;
};

export default RomanceScreen;

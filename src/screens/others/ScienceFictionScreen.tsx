import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const ScienceFictionScreen = () => {
  const data = GENRE_DATA["ScienceFiction"];
  return <GenreMasonryLayout data={data.items} />;
};

export default ScienceFictionScreen;

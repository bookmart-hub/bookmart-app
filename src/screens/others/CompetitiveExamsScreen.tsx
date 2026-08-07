import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const CompetitiveExamsScreen = () => {
  const data = GENRE_DATA["CompetitiveExams"];
  return <GenreMasonryLayout data={data.items} />;
};

export default CompetitiveExamsScreen;

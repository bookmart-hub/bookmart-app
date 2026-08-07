import GenreMasonryLayout from "@/components/ui/GenreMasonryLayout";
import { GENRE_DATA } from "@/data/genreMockData";
import React from "react";

const SelfHelpScreen = () => {
  const data = GENRE_DATA["SelfHelp"];
  return <GenreMasonryLayout data={data.items} />;
};

export default SelfHelpScreen;

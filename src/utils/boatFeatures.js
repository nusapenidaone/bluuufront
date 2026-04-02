import { Droplets, Home, Music, Umbrella, Wind } from "lucide-react";

export const bfOn = (v) => v === true || v === 1 || v === "1";

export const getBoatFeatures = (boatFeatures) => {
  const bf = boatFeatures || {};
  return [
    {
      label: bfOn(bf.shade) ? "Full shade + flybridge" : "Partial shade",
      present: true,
      Icon: Umbrella,
    },
    {
      label: bfOn(bf.cabin) ? "Cabin" : "No cabin",
      present: bfOn(bf.cabin),
      Icon: Home,
    },
    {
      label: bfOn(bf.ac) ? "AC" : "No AC",
      present: bfOn(bf.ac),
      Icon: Wind,
    },
    {
      label: bfOn(bf.sound) ? "In-built Sound System " : "JBL Speaker",
      present: bfOn(bf.sound),
      Icon: Music,
    },
    {
      label: bfOn(bf.toilet) ? "Toilet" : "No toilet",
      present: bfOn(bf.toilet),
      Icon: Droplets,
    },
  ];
};




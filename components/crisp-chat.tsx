"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("d9664841-6d44-492c-971c-3d3230d1a64b");
  }, []);
  return null;
};

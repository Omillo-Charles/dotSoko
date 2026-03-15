"use client";

import React from "react";
import LegalLayout from "@/components/layout/LegalLayout";
import { LEGAL_PAGES } from "@/constants/legal";

const CookiePolicyPage = () => {
  return <LegalLayout content={LEGAL_PAGES.cookies} />;
};

export default CookiePolicyPage;

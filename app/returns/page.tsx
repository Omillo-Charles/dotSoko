"use client";

import React from "react";
import LegalLayout from "@/components/layout/LegalLayout";
import { LEGAL_PAGES } from "@/constants/legal";

const ReturnsPage = () => {
  return <LegalLayout content={LEGAL_PAGES.returns} />;
};

export default ReturnsPage;

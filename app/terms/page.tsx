"use client";

import React from "react";
import LegalLayout from "@/components/layout/LegalLayout";
import { LEGAL_PAGES } from "@/constants/legal";

const TermsPage = () => {
  return <LegalLayout content={LEGAL_PAGES.terms} />;
};

export default TermsPage;

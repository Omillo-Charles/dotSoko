"use client";

import React from "react";
import LegalLayout from "@/components/layout/LegalLayout";
import { LEGAL_PAGES } from "@/constants/legal";

const PrivacyPage = () => {
  return <LegalLayout content={LEGAL_PAGES.privacy} />;
};

export default PrivacyPage;

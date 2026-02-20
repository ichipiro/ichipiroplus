"use client";

import { ChevronLeftIcon } from "@yamada-ui/lucide";
import { IconButton } from "@yamada-ui/react";
import { useRouter } from "next/navigation";

const MobileBackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  };

  return (
    <IconButton
      aria-label="戻る"
      icon={<ChevronLeftIcon />}
      variant="ghost"
      onClick={handleBack}
    />
  );
};

export default MobileBackButton;

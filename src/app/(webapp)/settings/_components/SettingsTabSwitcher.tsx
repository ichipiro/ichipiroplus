"use client";

import { Button, ButtonGroup } from "@yamada-ui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface SettingsTabItem {
  key: string;
  label: string;
}

interface SettingsTabSwitcherProps {
  tabs: SettingsTabItem[];
  activeTab: string;
  extraParamsByTab?: Record<string, Record<string, string | undefined>>;
}

const SettingsTabSwitcher = ({
  tabs,
  activeTab,
  extraParamsByTab,
}: SettingsTabSwitcherProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleMoveTab = (tabKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);

    const extraParams = extraParamsByTab?.[tabKey];
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <ButtonGroup
      attached
      variant="outline"
      w="max-content"
      minW="full"
      flexWrap="nowrap"
    >
      {tabs.map(tab => (
        <Button
          key={tab.key}
          colorScheme={activeTab === tab.key ? "blue" : "gray"}
          whiteSpace="nowrap"
          onClick={() => handleMoveTab(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default SettingsTabSwitcher;

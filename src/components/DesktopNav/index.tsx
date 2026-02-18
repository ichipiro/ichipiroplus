"use client";

import { ScrollArea } from "@yamada-ui/react";
import { usePathname } from "next/navigation";
import AccordionMenu from "./_components/AccordionMenu";
import { getNavigationItems } from "./_components/getNavigationItems";

const DesktopNav = () => {
  const pathname = usePathname();
  const navItems = getNavigationItems();

  return (
    <ScrollArea
      as="nav"
      pos="sticky"
      inset="md"
      h="calc(100vh - 32px)"
      w="sm"
      minW="sm"
      flexShrink={0}
      py={6}
      px={2}
      bg={["white", "black"]}
      type="always"
      display={{ base: "block", md: "none" }}
      borderRadius="lg"
      shadow="md"
    >
      <AccordionMenu navItems={navItems} pathname={pathname} />
    </ScrollArea>
  );
};

export default DesktopNav;

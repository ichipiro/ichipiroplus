import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import { HStack, VStack } from "@yamada-ui/react";
import type { ReactNode } from "react";

type WebappLayoutProps = {
  children?: ReactNode;
  params?: unknown;
};

const WebappLayout = ({ children }: WebappLayoutProps) => {
  return (
    <HStack w="full" minH="100vh" h="full" alignItems="stretch">
      <DesktopNav />
      <MobileNav />
      <VStack
        w="full"
        minW={0}
        h="full"
        gap={{ base: "lg", md: "sm" }}
        py={{ base: "lg", md: "sm" }}
        px={{ base: "lg", md: "md" }}
        alignItems="center"
        as="main"
      >
        {children}
      </VStack>
    </HStack>
  );
};

export default WebappLayout;

import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import { HStack, VStack } from "@yamada-ui/react";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type WebappLayoutProps = {
  children?: ReactNode;
  params?: Promise<Record<string, string | string[] | undefined>>;
};

const WebappLayout = ({ children }: WebappLayoutProps) => {
  return (
    <HStack
      w="full"
      minW={0}
      minH="100vh"
      h="full"
      alignItems="stretch"
      overflowX="clip"
    >
      <DesktopNav />
      <MobileNav />
      <VStack
        w="full"
        minW={0}
        overflowX="clip"
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

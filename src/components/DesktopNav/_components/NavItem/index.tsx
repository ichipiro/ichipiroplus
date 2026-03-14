"use client";

import { HStack, Icon, Text } from "@yamada-ui/react";
import Link from "next/link";

interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  href: string;
  isHighlight: boolean;
  onClick: () => void;
}

const NavItem = ({ label, icon, href, isHighlight, onClick }: NavItemProps) => {
  return (
    <Link
      href={href}
      passHref
      style={{
        display: "flex",
        width: "100%",
        textDecoration: "none",
      }}
      onClick={onClick}
    >
      <HStack w="full">
        {icon && <Icon as={() => icon} boxSize="18px" />}

        <Text as={isHighlight ? "u" : "p"}>{label}</Text>
      </HStack>
    </Link>
  );
};

export default NavItem;

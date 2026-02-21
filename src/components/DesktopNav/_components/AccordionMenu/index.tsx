"use client";

import { ChevronDownIcon, ChevronRightIcon } from "@yamada-ui/lucide";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  type AccordionProps,
  Box,
  VStack,
} from "@yamada-ui/react";
import { useState } from "react";
import NavItem from "../NavItem";
import type { NavMenuItem } from "../getNavigationItems";

interface AccordionMenuProps {
  navItems: NavMenuItem[];
  pathname: string;
}

const EmptyAccordionIcon = () => null;

const getDefaultIndexes = (
  items: NavMenuItem[],
  pathname: string,
): number[] => {
  const hasActiveChild = (children?: NavMenuItem[]): boolean => {
    if (!children || children.length === 0) return false;
    return children.some(
      child => child.href === pathname || hasActiveChild(child.children),
    );
  };

  return items
    .map((item, index) => {
      if (item.href === pathname || hasActiveChild(item.children)) {
        return index;
      }
      return -1;
    })
    .filter(index => index !== -1);
};

const AccordionMenu = ({ navItems, pathname }: AccordionMenuProps) => {
  const defaultIndex = getDefaultIndexes(navItems, pathname);

  const [index, onChange] = useState<AccordionProps["index"] | undefined>(
    undefined,
  );

  return (
    <Accordion
      index={index}
      onChange={onChange}
      toggle
      w="full"
      variant="unstyled"
      defaultIndex={defaultIndex}
      mt="sm"
    >
      <VStack align="start" w="full" gap="sm">
        {navItems.map(({ label, icon, href, children }, idx) => (
          <Box w="full" key={`${label}`}>
            <AccordionItem
              label={
                <NavItem
                  label={label}
                  icon={icon}
                  href={href}
                  isHighlight={pathname === href}
                  onClick={() => {
                    if (children && children.length > 0) {
                      onChange(idx);
                    }
                  }}
                />
              }
              icon={
                children && children.length > 0 ? (
                  ({ isExpanded }) => {
                    const Icon = isExpanded
                      ? ChevronDownIcon
                      : ChevronRightIcon;
                    return (
                      <Icon color={["blackAlpha.800", "whiteAlpha.700"]} />
                    );
                  }
                ) : (
                  <EmptyAccordionIcon />
                )
              }
            >
              {children && children.length > 0 && (
                <AccordionPanel
                  borderLeft="1px solid"
                  borderColor="gray.200"
                  ml="md"
                >
                  <AccordionMenu navItems={children} pathname={pathname} />
                </AccordionPanel>
              )}
            </AccordionItem>
          </Box>
        ))}
      </VStack>
    </Accordion>
  );
};

export default AccordionMenu;

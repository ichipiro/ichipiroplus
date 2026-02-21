import { Box, Center, HStack, Heading, Skeleton, Text } from "@yamada-ui/react";
import { Suspense } from "react";
import UserMenu from "../features/user/components/UserMenu";
import MobileBackButton from "./MobileBackButton";
import { ThemeToggleButton } from "./ThemeToggleButton";

const Header = () => {
  return (
    <Center as="header" w="full" position="sticky" py="md" zIndex={10}>
      <Box w="full" maxW="9xl" px={{ base: "lg", md: "md" }}>
        <HStack display={{ base: "flex", md: "none" }}>
          <Text>
            <Heading as="span" fontFamily="sans-serif">
              I
            </Heading>
            <Heading as="span">chipiro+</Heading>
          </Text>

          <Box ms="auto">
            <ThemeToggleButton />
          </Box>

          <Suspense
            fallback={
              <Skeleton borderRadius="full" width="48px" height="48px" />
            }
          >
            <UserMenu />
          </Suspense>
        </HStack>

        <HStack
          display={{ base: "none", md: "flex" }}
          minH="48px"
          position="relative"
        >
          <Box position="absolute" left={0}>
            <MobileBackButton />
          </Box>

          <Center w="full">
            <Text>
              <Heading as="span" fontFamily="sans-serif">
                I
              </Heading>
              <Heading as="span">chipiro+</Heading>
            </Text>
          </Center>

          <Box position="absolute" right={0}>
            <Suspense
              fallback={
                <Skeleton borderRadius="full" width="48px" height="48px" />
              }
            >
              <UserMenu />
            </Suspense>
          </Box>
        </HStack>
      </Box>
    </Center>
  );
};

export default Header;

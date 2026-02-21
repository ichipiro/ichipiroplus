import { Box, HStack, Skeleton, VStack } from "@yamada-ui/react";

const Loading = () => {
  return (
    <VStack w="full" align="stretch" px={{ base: 4, md: 6 }} py={6} gap={6}>
      <Skeleton h="3rem" borderRadius="md" />
      <HStack align="stretch" gap={6}>
        <VStack
          display={{ base: "none", md: "flex" }}
          minW="16rem"
          w="16rem"
          align="stretch"
          gap={3}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={`nav-skeleton-${idx + 1}`}
              h="2.5rem"
              borderRadius="md"
            />
          ))}
        </VStack>
        <Box flex={1} minW={0}>
          <VStack align="stretch" gap={4}>
            <Skeleton h="2.5rem" borderRadius="md" />
            <Skeleton h="8rem" borderRadius="lg" />
            <Skeleton h="18rem" borderRadius="lg" />
          </VStack>
        </Box>
      </HStack>
    </VStack>
  );
};

export default Loading;

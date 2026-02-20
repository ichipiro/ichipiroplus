import { Box, HStack, Skeleton, VStack } from "@yamada-ui/react";

const WebappLoading = () => {
  return (
    <HStack w="full" align="stretch" gap={{ base: 0, md: 4 }}>
      <VStack
        display={{ base: "none", md: "flex" }}
        minW="16rem"
        w="16rem"
        align="stretch"
        gap={3}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton
            key={`webapp-nav-skeleton-${idx + 1}`}
            h="2.5rem"
            borderRadius="md"
          />
        ))}
      </VStack>

      <Box flex={1} minW={0}>
        <VStack align="stretch" gap={4} w="full">
          <Skeleton h="2.5rem" borderRadius="md" />
          <Skeleton h="7rem" borderRadius="lg" />
          <Skeleton h="18rem" borderRadius="lg" />
        </VStack>
      </Box>
    </HStack>
  );
};

export default WebappLoading;

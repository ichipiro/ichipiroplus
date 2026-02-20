import { Box, Skeleton, VStack } from "@yamada-ui/react";

const StaticLoading = () => {
  return (
    <VStack
      w="full"
      maxW="4xl"
      mx="auto"
      px={{ base: 4, md: 6 }}
      py={8}
      gap={4}
    >
      <Skeleton h="2.5rem" borderRadius="md" />
      <Skeleton h="1.5rem" w="70%" borderRadius="md" />
      <Box pt={2} w="full">
        <Skeleton h="18rem" borderRadius="lg" />
      </Box>
    </VStack>
  );
};

export default StaticLoading;

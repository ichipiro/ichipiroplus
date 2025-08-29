import { Box, Tag } from "@yamada-ui/lucide";
import { Avatar, HStack, Heading, Text, VStack } from "@yamada-ui/react";
import type { UserWithRelations } from "../types";

interface ProfileHeaderProps {
  user: UserWithRelations;
  articlesCount: number;
}

const ProfileHeader = ({ user, articlesCount }: ProfileHeaderProps) => {
  return (
    <Box as="section" py={8} borderBottomWidth="1px" borderColor="gray.200">
      <HStack>
        <Avatar
          src={user.image || undefined}
          name={user.displayName || ""}
          size="2xl"
          border="4px solid white"
          shadow="md"
        />

        <VStack align="start" flex={1}>
          <VStack align="start" gap="xs">
            <Heading size="xl">{user.displayName || "ユーザー"}</Heading>
            <Text color="gray.600" fontSize="sm">
              @{user.username}
            </Text>

            <Text>{user.introduction}</Text>
          </VStack>

          <HStack wrap="wrap">
            <HStack>
              <Text fontWeight="bold">{articlesCount}</Text>
              <Text color="gray.600">記事</Text>
            </HStack>

            {user.faculty && (
              <Tag colorScheme="blue" size="md">
                {user.faculty.name}
              </Tag>
            )}

            {user.department && (
              <Tag colorScheme="green" size="md">
                {user.department.name}
              </Tag>
            )}

            {user.grade && (
              <Tag colorScheme="purple" size="md">
                {user.grade}年生
              </Tag>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;

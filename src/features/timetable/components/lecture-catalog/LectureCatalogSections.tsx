import { Box, Text, VStack } from "@yamada-ui/react";

interface LectureCatalogSectionsProps {
  lecture: {
    purpose: string | null;
    goal: string | null;
    description: string | null;
    evalMethod: string | null;
    textbook: string | null;
    feedback: string | null;
    biko: string | null;
  };
}

const textColor = {
  color: "gray.700",
  _dark: { color: "gray.200" },
} as const;

const LectureCatalogSections = ({ lecture }: LectureCatalogSectionsProps) => {
  return (
    <VStack align="stretch" gap={4}>
      <Box>
        <Text fontWeight="bold" mb={1}>
          授業目的
        </Text>
        <Text {...textColor}>{lecture.purpose || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          到達目標
        </Text>
        <Text {...textColor}>{lecture.goal || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          授業内容
        </Text>
        <Text {...textColor}>{lecture.description || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          評価方法
        </Text>
        <Text {...textColor}>{lecture.evalMethod || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          教科書
        </Text>
        <Text {...textColor}>{lecture.textbook || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          フィードバック
        </Text>
        <Text {...textColor}>{lecture.feedback || "未設定"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold" mb={1}>
          備考
        </Text>
        <Text {...textColor}>{lecture.biko || "未設定"}</Text>
      </Box>
    </VStack>
  );
};

export default LectureCatalogSections;

import { Badge, Button, HStack, Heading, VStack } from "@yamada-ui/react";

interface LectureCatalogHeaderProps {
  lecture: {
    id: string;
    name: string;
    syllabusCode: string | null;
    grade: number;
    isRequired: boolean;
    isExam: boolean;
  };
  canEdit: boolean;
}

const LectureCatalogHeader = ({
  lecture,
  canEdit,
}: LectureCatalogHeaderProps) => {
  return (
    <HStack
      justify="space-between"
      align={{ base: "start", md: "stretch" }}
      flexDirection={{ base: "row", md: "column" }}
      gap={4}
    >
      <VStack align="start" gap={2}>
        <Heading as="h1" size="lg">
          {lecture.name}
        </Heading>
        <HStack gap={2} wrap="wrap">
          <Badge colorScheme="blue">
            シラバス: {lecture.syllabusCode ?? "未設定"}
          </Badge>
          <Badge colorScheme="teal">{lecture.grade}年対象</Badge>
          {lecture.isRequired && <Badge colorScheme="orange">必修</Badge>}
          {lecture.isExam && <Badge colorScheme="red">試験あり</Badge>}
        </HStack>
      </VStack>

      <HStack
        w={{ base: "auto", md: "full" }}
        justify={{ base: "flex-end", md: "stretch" }}
        flexDirection={{ base: "row", md: "column" }}
      >
        <Button
          as="a"
          href={`/lectures/${lecture.id}/edit`}
          colorScheme="blue"
          disabled={!canEdit}
          w={{ base: "auto", md: "full" }}
        >
          編集
        </Button>
        <Button
          as="a"
          href="/lectures"
          variant="outline"
          w={{ base: "auto", md: "full" }}
        >
          一覧に戻る
        </Button>
      </HStack>
    </HStack>
  );
};

export default LectureCatalogHeader;

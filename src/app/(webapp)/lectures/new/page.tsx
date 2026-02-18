import { getCurrentTerm, getTerms } from "@/features/timetable/actions";
import CreateLectureForm from "@/features/timetable/components/CreateLectureForm";
import { Heading, Text, VStack } from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "講義追加",
  description: "ユーザー独自の講義や予定を追加できます",
};

const LectureCreatePage = async () => {
  const [terms, currentTerm] = await Promise.all([
    getTerms(),
    getCurrentTerm(),
  ]);

  return (
    <VStack align="stretch" gap={4} w="full">
      <Heading as="h1" size="xl">
        講義追加
      </Heading>
      <Text color="gray.600">
        時間割に使う講義を追加します。スクレイピング漏れの講義や個人予定も登録できます。
      </Text>

      <CreateLectureForm
        termOptions={terms.map(term => ({
          number: term.number,
          name: term.name,
        }))}
        defaultTermNumber={currentTerm.number}
      />
    </VStack>
  );
};

export default LectureCreatePage;

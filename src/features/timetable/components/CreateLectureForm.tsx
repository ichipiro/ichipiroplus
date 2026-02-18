"use client";

import { createLecture } from "@/features/timetable/actions";
import { DAYS, TIMES } from "@/features/timetable/constant";
import { getScheduleKey } from "@/features/timetable/utils";
import useActionFeedback from "@/hooks/useActionFeedback";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  FormControl,
  HStack,
  Input,
  Switch,
  Text,
  Textarea,
  VStack,
  Wrap,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface CreateLectureFormProps {
  termOptions: { number: number; name: string }[];
  defaultTermNumber: number;
}

const DAY_LABELS: Record<number, string> = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
};

const SCHEDULE_OPTIONS = DAYS.flatMap(day =>
  TIMES.map(time => ({
    id: getScheduleKey(day, time),
    label: `${DAY_LABELS[day]}曜${time}限`,
  })),
);

const CreateLectureForm = ({
  termOptions,
  defaultTermNumber,
}: CreateLectureFormProps) => {
  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [room, setRoom] = useState("");
  const [biko, setBiko] = useState("");
  const [selectedTermNumbers, setSelectedTermNumbers] = useState<number[]>([
    defaultTermNumber,
  ]);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isPublicEditable, setIsPublicEditable] = useState(false);

  const toggleTermNumber = (termNumber: number) => {
    setSelectedTermNumbers(prev =>
      prev.includes(termNumber)
        ? prev.filter(value => value !== termNumber)
        : [...prev, termNumber],
    );
  };

  const toggleScheduleId = (scheduleId: number) => {
    setSelectedScheduleIds(prev =>
      prev.includes(scheduleId)
        ? prev.filter(value => value !== scheduleId)
        : [...prev, scheduleId],
    );
  };

  const handleSubmit = () => {
    if (
      !name.trim() ||
      selectedTermNumbers.length === 0 ||
      selectedScheduleIds.length === 0
    ) {
      return;
    }

    startTransition(async () => {
      const created = await withFeedback(
        createLecture({
          name: name.trim(),
          instructor: instructor.trim() || null,
          room: room.trim() || null,
          biko: biko.trim() || null,
          termNumbers: selectedTermNumbers,
          scheduleIds: selectedScheduleIds,
          isPublic,
          isPublicEditable,
        }),
        {
          successTitle: "講義追加",
          successMessage: "講義を追加しました",
        },
      );

      if (created) {
        router.push(`/lectures/${created.id}`);
        router.refresh();
      }
    });
  };

  return (
    <VStack align="stretch" gap={4} w="full" maxW="3xl">
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>
            スクレイピング漏れや個人用の予定にも対応できます
          </AlertTitle>
          <AlertDescription>
            例:
            自主ゼミ、サークル、アルバイト。作成後は時間割や講義検索から利用できます。
          </AlertDescription>
        </Box>
      </Alert>

      <Box borderWidth="1px" borderRadius="lg" p={5} bg={["white", "black"]}>
        <VStack align="stretch" gap={4}>
          <FormControl label="講義名" required>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 応用統計学 / サークル活動"
            />
          </FormControl>

          <HStack align="start" gap={4} flexWrap="wrap">
            <FormControl label="担当" w={{ base: "full", md: "48%" }}>
              <Input
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                placeholder="例: 山田太郎"
              />
            </FormControl>

            <FormControl label="教室・場所" w={{ base: "full", md: "48%" }}>
              <Input
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="例: A101 / 部室"
              />
            </FormControl>
          </HStack>

          <FormControl label="ターム" required>
            <Wrap>
              {termOptions.map(term => {
                const checked = selectedTermNumbers.includes(term.number);
                return (
                  <Checkbox
                    key={term.number}
                    isChecked={checked}
                    onChange={() => toggleTermNumber(term.number)}
                  >
                    {term.name}
                  </Checkbox>
                );
              })}
            </Wrap>
          </FormControl>

          <FormControl label="開講時期（曜日・時限）" required>
            <Wrap>
              {SCHEDULE_OPTIONS.map(schedule => {
                const checked = selectedScheduleIds.includes(schedule.id);
                return (
                  <Checkbox
                    key={schedule.id}
                    isChecked={checked}
                    onChange={() => toggleScheduleId(schedule.id)}
                  >
                    {schedule.label}
                  </Checkbox>
                );
              })}
            </Wrap>
          </FormControl>

          <FormControl label="備考">
            <Textarea
              value={biko}
              onChange={e => setBiko(e.target.value)}
              placeholder="補足情報があれば入力してください"
              minH="120px"
            />
          </FormControl>

          <VStack align="stretch" gap={3} pt={2}>
            <Switch
              isChecked={isPublic}
              onChange={() => setIsPublic(prev => !prev)}
            >
              公開する（他ユーザーに表示可能）
            </Switch>
            <Switch
              isChecked={isPublicEditable}
              onChange={() => setIsPublicEditable(prev => !prev)}
            >
              他ユーザーの編集を許可する
            </Switch>
          </VStack>

          <HStack justify="space-between" pt={2}>
            <Text color="gray.600" fontSize="sm">
              追加後は講義詳細ページで登録や設定を行えます。
            </Text>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              loading={isPending}
              isDisabled={
                !name.trim() ||
                selectedTermNumbers.length === 0 ||
                selectedScheduleIds.length === 0
              }
            >
              講義を追加
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default CreateLectureForm;

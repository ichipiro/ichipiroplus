"use client";

import { updateLecture } from "@/features/timetable/actions";
import { DAYS, TIMES } from "@/features/timetable/constant";
import { getScheduleKey } from "@/features/timetable/utils";
import useActionFeedback from "@/hooks/useActionFeedback";
import {
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

interface EditLectureFormProps {
  lectureId: string;
  initialData: {
    name: string;
    instructor: string;
    room: string;
    biko: string;
    termNumbers: number[];
    scheduleIds: number[];
    isPublic: boolean;
    isPublicEditable: boolean;
  };
  termOptions: { number: number; name: string }[];
  canEdit: boolean;
  canChangeVisibility: boolean;
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

const EditLectureForm = ({
  lectureId,
  initialData,
  termOptions,
  canEdit,
  canChangeVisibility,
}: EditLectureFormProps) => {
  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData.name);
  const [instructor, setInstructor] = useState(initialData.instructor);
  const [room, setRoom] = useState(initialData.room);
  const [biko, setBiko] = useState(initialData.biko);
  const [selectedTermNumbers, setSelectedTermNumbers] = useState<number[]>(
    initialData.termNumbers,
  );
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>(
    initialData.scheduleIds,
  );
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const [isPublicEditable, setIsPublicEditable] = useState(
    initialData.isPublicEditable,
  );

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
      !canEdit ||
      !name.trim() ||
      selectedTermNumbers.length === 0 ||
      selectedScheduleIds.length === 0
    ) {
      return;
    }

    startTransition(async () => {
      const updated = await withFeedback(
        updateLecture(lectureId, {
          name: name.trim(),
          instructor: instructor.trim() || null,
          room: room.trim() || null,
          biko: biko.trim() || null,
          termNumbers: selectedTermNumbers,
          scheduleIds: selectedScheduleIds,
          ...(canChangeVisibility
            ? {
                isPublic,
                isPublicEditable,
              }
            : {}),
        }),
        {
          successTitle: "講義編集",
          successMessage: "講義情報を更新しました",
        },
      );

      if (updated) {
        router.push(`/lectures/${lectureId}`);
        router.refresh();
      }
    });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={5} bg={["white", "black"]}>
      <VStack align="stretch" gap={4}>
        <FormControl label="講義名" required>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            isDisabled={!canEdit}
          />
        </FormControl>

        <HStack align="start" gap={4} flexWrap="wrap">
          <FormControl label="担当" w={{ base: "full", md: "48%" }}>
            <Input
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              isDisabled={!canEdit}
            />
          </FormControl>

          <FormControl label="教室・場所" w={{ base: "full", md: "48%" }}>
            <Input
              value={room}
              onChange={e => setRoom(e.target.value)}
              isDisabled={!canEdit}
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
                  isDisabled={!canEdit}
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
                  isDisabled={!canEdit}
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
            minH="120px"
            isDisabled={!canEdit}
          />
        </FormControl>

        <VStack align="stretch" gap={3} pt={2}>
          <Switch
            isChecked={isPublic}
            onChange={() => setIsPublic(prev => !prev)}
            isDisabled={!canEdit || !canChangeVisibility}
          >
            公開する（他ユーザーに表示可能）
          </Switch>
          <Switch
            isChecked={isPublicEditable}
            onChange={() => setIsPublicEditable(prev => !prev)}
            isDisabled={!canEdit || !canChangeVisibility}
          >
            他ユーザーの編集を許可する
          </Switch>
        </VStack>

        <HStack justify="space-between" pt={2}>
          <Text color="gray.600" fontSize="sm">
            {canEdit
              ? "変更内容は保存後に即時反映されます。"
              : "この講義の編集権限がないため、保存できません。"}
          </Text>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            loading={isPending}
            isDisabled={
              !canEdit ||
              !name.trim() ||
              selectedTermNumbers.length === 0 ||
              selectedScheduleIds.length === 0
            }
          >
            保存
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default EditLectureForm;

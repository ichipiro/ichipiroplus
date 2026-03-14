"use client";

import { updateLecture } from "@/features/timetable/actions";
import { SCHEDULE_OPTIONS } from "@/features/timetable/utils";
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
import { useReducer, useTransition } from "react";

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

type FormState = {
  name: string;
  instructor: string;
  room: string;
  biko: string;
  selectedTermNumbers: number[];
  selectedScheduleIds: number[];
  isPublic: boolean;
  isPublicEditable: boolean;
};

type FormAction =
  | {
      type: "setField";
      field: "name" | "instructor" | "room" | "biko";
      value: string;
    }
  | { type: "toggleIsPublic" }
  | { type: "toggleIsPublicEditable" };

const createInitialFormState = (
  initialData: EditLectureFormProps["initialData"],
): FormState => ({
  name: initialData.name,
  instructor: initialData.instructor,
  room: initialData.room,
  biko: initialData.biko,
  selectedTermNumbers: initialData.termNumbers,
  selectedScheduleIds: initialData.scheduleIds,
  isPublic: initialData.isPublic,
  isPublicEditable: initialData.isPublicEditable,
});

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value };
    case "toggleIsPublic":
      return { ...state, isPublic: !state.isPublic };
    case "toggleIsPublicEditable":
      return { ...state, isPublicEditable: !state.isPublicEditable };
    default:
      return state;
  }
};

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

  const [state, dispatch] = useReducer(
    formReducer,
    initialData,
    createInitialFormState,
  );

  const handleSubmit = () => {
    if (!canEdit || !state.name.trim()) {
      return;
    }

    startTransition(async () => {
      const updated = await withFeedback(
        updateLecture(lectureId, {
          name: state.name.trim(),
          instructor: state.instructor.trim() || null,
          room: state.room.trim() || null,
          biko: state.biko.trim() || null,
          termNumbers: state.selectedTermNumbers,
          scheduleIds: state.selectedScheduleIds,
          ...(canChangeVisibility
            ? {
                isPublic: state.isPublic,
                isPublicEditable: state.isPublicEditable,
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
            value={state.name}
            onChange={e =>
              dispatch({
                type: "setField",
                field: "name",
                value: e.target.value,
              })
            }
            disabled={!canEdit}
          />
        </FormControl>

        <HStack align="start" gap={4} flexWrap="wrap">
          <FormControl label="担当" w={{ base: "full", md: "48%" }}>
            <Input
              value={state.instructor}
              onChange={e =>
                dispatch({
                  type: "setField",
                  field: "instructor",
                  value: e.target.value,
                })
              }
              disabled={!canEdit}
            />
          </FormControl>

          <FormControl label="教室・場所" w={{ base: "full", md: "48%" }}>
            <Input
              value={state.room}
              onChange={e =>
                dispatch({
                  type: "setField",
                  field: "room",
                  value: e.target.value,
                })
              }
              disabled={!canEdit}
            />
          </FormControl>
        </HStack>

        <FormControl label="ターム" required>
          <Wrap>
            {termOptions.map(term => {
              const checked = state.selectedTermNumbers.includes(term.number);
              return (
                <Checkbox key={term.number} checked={checked} disabled readOnly>
                  {term.name}
                </Checkbox>
              );
            })}
          </Wrap>
          <Text mt={2} fontSize="sm" color="gray.600">
            タームは編集できません。
          </Text>
        </FormControl>

        <FormControl label="開講時期（曜日・時限）" required>
          <Wrap>
            {SCHEDULE_OPTIONS.map(schedule => {
              const checked = state.selectedScheduleIds.includes(schedule.id);
              return (
                <Checkbox key={schedule.id} checked={checked} disabled readOnly>
                  {schedule.label}
                </Checkbox>
              );
            })}
          </Wrap>
          <Text mt={2} fontSize="sm" color="gray.600">
            曜日時限は編集できません。
          </Text>
        </FormControl>

        <FormControl label="備考">
          <Textarea
            value={state.biko}
            onChange={e =>
              dispatch({
                type: "setField",
                field: "biko",
                value: e.target.value,
              })
            }
            minH="120px"
            disabled={!canEdit}
          />
        </FormControl>

        <VStack align="stretch" gap={3} pt={2}>
          <Switch
            checked={state.isPublic}
            onChange={() => dispatch({ type: "toggleIsPublic" })}
            disabled={!canEdit || !canChangeVisibility}
          >
            公開する（他ユーザーに表示可能）
          </Switch>
          <Switch
            checked={state.isPublicEditable}
            onChange={() => dispatch({ type: "toggleIsPublicEditable" })}
            disabled={!canEdit || !canChangeVisibility}
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
            disabled={
              !canEdit ||
              !state.name.trim() ||
              state.selectedTermNumbers.length === 0 ||
              state.selectedScheduleIds.length === 0
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

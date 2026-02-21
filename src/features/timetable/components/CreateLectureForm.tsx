"use client";

import { createLecture } from "@/features/timetable/actions";
import { SCHEDULE_OPTIONS } from "@/features/timetable/utils";
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
import { useReducer, useTransition } from "react";

interface CreateLectureFormProps {
  termOptions: { number: number; name: string }[];
  defaultTermNumber: number;
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
  | { type: "toggleTermNumber"; termNumber: number }
  | { type: "toggleScheduleId"; scheduleId: number }
  | { type: "toggleIsPublic" }
  | { type: "toggleIsPublicEditable" };

const createInitialFormState = (defaultTermNumber: number): FormState => ({
  name: "",
  instructor: "",
  room: "",
  biko: "",
  selectedTermNumbers: [defaultTermNumber],
  selectedScheduleIds: [],
  isPublic: true,
  isPublicEditable: false,
});

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value };
    case "toggleTermNumber":
      return {
        ...state,
        selectedTermNumbers: state.selectedTermNumbers.includes(
          action.termNumber,
        )
          ? state.selectedTermNumbers.filter(
              value => value !== action.termNumber,
            )
          : [...state.selectedTermNumbers, action.termNumber],
      };
    case "toggleScheduleId":
      return {
        ...state,
        selectedScheduleIds: state.selectedScheduleIds.includes(
          action.scheduleId,
        )
          ? state.selectedScheduleIds.filter(
              value => value !== action.scheduleId,
            )
          : [...state.selectedScheduleIds, action.scheduleId],
      };
    case "toggleIsPublic":
      return { ...state, isPublic: !state.isPublic };
    case "toggleIsPublicEditable":
      return { ...state, isPublicEditable: !state.isPublicEditable };
    default:
      return state;
  }
};

const CreateLectureForm = ({
  termOptions,
  defaultTermNumber,
}: CreateLectureFormProps) => {
  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  const [state, dispatch] = useReducer(
    formReducer,
    defaultTermNumber,
    createInitialFormState,
  );

  const handleSubmit = () => {
    if (
      !state.name.trim() ||
      state.selectedTermNumbers.length === 0 ||
      state.selectedScheduleIds.length === 0
    ) {
      return;
    }

    startTransition(async () => {
      const created = await withFeedback(
        createLecture({
          name: state.name.trim(),
          instructor: state.instructor.trim() || null,
          room: state.room.trim() || null,
          biko: state.biko.trim() || null,
          termNumbers: state.selectedTermNumbers,
          scheduleIds: state.selectedScheduleIds,
          isPublic: state.isPublic,
          isPublicEditable: state.isPublicEditable,
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
              value={state.name}
              onChange={e =>
                dispatch({
                  type: "setField",
                  field: "name",
                  value: e.target.value,
                })
              }
              placeholder="例: 応用統計学 / サークル活動"
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
                placeholder="例: 山田太郎"
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
                placeholder="例: A101 / 部室"
              />
            </FormControl>
          </HStack>

          <FormControl label="ターム" required>
            <Wrap>
              {termOptions.map(term => {
                const checked = state.selectedTermNumbers.includes(term.number);
                return (
                  <Checkbox
                    key={term.number}
                    checked={checked}
                    onChange={() =>
                      dispatch({
                        type: "toggleTermNumber",
                        termNumber: term.number,
                      })
                    }
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
                const checked = state.selectedScheduleIds.includes(schedule.id);
                return (
                  <Checkbox
                    key={schedule.id}
                    checked={checked}
                    onChange={() =>
                      dispatch({
                        type: "toggleScheduleId",
                        scheduleId: schedule.id,
                      })
                    }
                  >
                    {schedule.label}
                  </Checkbox>
                );
              })}
            </Wrap>
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
              placeholder="補足情報があれば入力してください"
              minH="120px"
            />
          </FormControl>

          <VStack align="stretch" gap={3} pt={2}>
            <Switch
              checked={state.isPublic}
              onChange={() => dispatch({ type: "toggleIsPublic" })}
            >
              公開する（他ユーザーに表示可能）
            </Switch>
            <Switch
              checked={state.isPublicEditable}
              onChange={() => dispatch({ type: "toggleIsPublicEditable" })}
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
              disabled={
                !state.name.trim() ||
                state.selectedTermNumbers.length === 0 ||
                state.selectedScheduleIds.length === 0
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

"use client";

import type { RegistrationWithRelations } from "@/features/timetable/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { PlusIcon } from "@yamada-ui/lucide";
import { Box, Button, VStack, useDisclosure } from "@yamada-ui/react";
import { useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import type { TaskWithRelations } from "../types";
import CreateTaskForm from "./CreateTaskForm";
import DeleteCompletedTasksDialog from "./DeleteCompletedTasksDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import EditTaskModal from "./EditTaskModal";
import TaskColumn from "./TaskColumn";

interface TasksDashboardProps {
  initialTasks: TaskWithRelations[];
  registrations?: RegistrationWithRelations[];
  registration_id?: string;
}

const TasksDashboard = ({
  initialTasks,
  registrations,
  registration_id,
}: TasksDashboardProps) => {
  const store = useTaskStore();
  const { open, onToggle } = useDisclosure();
  const { withFeedback } = useActionFeedback();

  // 初期データをロード
  useEffect(() => {
    store.loadTasks(initialTasks);
  }, [initialTasks, store.loadTasks]);

  return (
    <Box w="full">
      <Box w="full">
        <Button
          leftIcon={<PlusIcon />}
          onClick={onToggle}
          colorScheme="blue"
          size="sm"
          mb={4}
        >
          {open ? "キャンセル" : "タスクを追加"}
        </Button>

        {open && (
          <CreateTaskForm
            registrations={registrations}
            defaultRegistrationId={registration_id}
            onSuccess={() => onToggle()}
          />
        )}
      </Box>

      <VStack>
        <TaskColumn title="未着手" tasks={store.todoTasks} />
        <TaskColumn title="進行中" tasks={store.inProgressTasks} />
        <TaskColumn
          title="完了"
          tasks={store.completedTasks}
          extraHeader={
            store.completedTasks.length > 0 && (
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={store.openDeleteCompletedDialog}
                isDisabled={store.isPending}
              >
                完了タスクをすべて削除
              </Button>
            )
          }
        />
      </VStack>

      <EditTaskModal
        isOpen={store.modals.edit}
        onClose={() => store.closeModal("edit")}
        task={store.selectedTask}
        registrations={registrations}
        onSuccess={() => store.closeModal("edit")}
      />

      {store.selectedTask && (
        <DeleteTaskDialog
          isOpen={store.modals.delete}
          onClose={() => store.closeModal("delete")}
          onDelete={async () => {
            if (store.selectedTask) {
              await withFeedback(store.deleteTask(store.selectedTask.id), {
                successMessage: "タスクを削除しました",
                successTitle: "タスク削除",
              });
              store.closeModal("delete");
            }
            return true;
          }}
        />
      )}

      <DeleteCompletedTasksDialog
        isOpen={store.modals.deleteCompleted}
        onClose={() => store.closeModal("deleteCompleted")}
        onDelete={async () => {
          const count = await withFeedback(store.deleteCompletedTasks(), {
            successMessage: count => `${count}件の完了タスクを削除しました`,
            successTitle: "一括削除",
          });
          if (count !== undefined) {
            store.closeModal("deleteCompleted");
          }
          return true;
        }}
        taskCount={store.completedTasks.length}
      />
    </Box>
  );
};

export default TasksDashboard;

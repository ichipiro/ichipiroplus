import MyProfileEditForm from "@/features/user/components/MyProfileEditForm";
import type {
  Department,
  Faculty,
  UserWithRelations,
} from "@/features/user/types";
import { Card, CardBody, CardHeader, Heading } from "@yamada-ui/react";

interface StepProfileProps {
  onStepNext: () => void;
  onStepPrev: () => void;
  departments: Department[];
  faculties: Faculty[];
  user: UserWithRelations | null;
  userId: string;
}

const StepProfile = ({
  departments,
  faculties,
  user,
  userId,
  onStepNext,
}: StepProfileProps) => {
  // 初回登録時は空のユーザーオブジェクトを作成
  const currentUser: UserWithRelations = user ?? {
    id: userId,
    email: null,
    emailVerified: null,
    name: null,
    image: null,
    username: "",
    displayName: "",
    introduction: null,
    grade: null,
    facultyId: null,
    departmentId: null,
    isProfileComplete: false,
    isAdmin: false,
    isTimetablePublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    faculty: null,
    department: null,
  };

  return (
    <Card
      variant="outline"
      bg={["white", "black"]}
      p="md"
      w={{ base: "4xl", md: "sm" }}
    >
      <CardHeader>
        <Heading size="xl">プロフィール設定</Heading>
      </CardHeader>

      <CardBody>
        <MyProfileEditForm
          departments={departments}
          faculties={faculties}
          user={currentUser}
          onSuccess={() => {
            onStepNext();
          }}
          isFirst
        />
      </CardBody>
    </Card>
  );
};

export default StepProfile;

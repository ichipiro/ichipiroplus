import {
  getAllDepartments,
  getAllFaculties,
  getCurrentUser,
} from "@/features/user/actions";
import { auth } from "@/lib/auth";
import { VStack } from "@yamada-ui/react";
import { notFound } from "next/navigation";
import RegistrationSteps from "./_components/RegistrationsSteps";

const RegisterPage = async () => {
  const session = await auth();

  if (!session || !session.user) {
    notFound();
  }

  const [user, departments, faculties] = await Promise.all([
    getCurrentUser(),
    getAllDepartments(),
    getAllFaculties(),
  ]);

  return (
    <VStack alignItems="center">
      <RegistrationSteps
        departments={departments}
        faculties={faculties}
        user={user}
        userId={session.user.id}
      />
    </VStack>
  );
};

export default RegisterPage;

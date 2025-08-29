// RegistrationSteps.tsx
"use client";

import type { Department, Faculty, UserWithRelations } from "@/features/user/types";
import RegistrationStepper from "../RegistrationStepper";
import StepIntro from "../StepIntro";
import StepProfile from "../StepProfile";

interface RegistrationStepsProps {
  departments: Department[];
  faculties: Faculty[];
  user: UserWithRelations | null;
  userId: string;
}

const RegistrationSteps = ({
  departments,
  faculties,
  user,
  userId,
}: RegistrationStepsProps) => {
  return (
    <RegistrationStepper
      renderItem={({ onStepNext, onStepPrev }) => [
        <StepIntro key={1} onStepNext={onStepNext} onStepPrev={onStepPrev} />,
        <StepProfile
          key={2}
          departments={departments}
          faculties={faculties}
          user={user}
          userId={userId}
          onStepNext={onStepNext}
          onStepPrev={onStepPrev}
        />,
      ]}
    />
  );
};

export default RegistrationSteps;

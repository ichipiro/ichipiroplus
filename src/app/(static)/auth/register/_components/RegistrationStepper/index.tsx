"use client";

import { Stepper, type Steps, useSteps } from "@yamada-ui/react";
import type { ReactElement } from "react";

interface RegistrationStepperProps {
  renderItem: (props: {
    onStepNext: () => void;
    onStepPrev: () => void;
  }) => ReactElement[];
}

const RegistrationStepper = ({ renderItem }: RegistrationStepperProps) => {
  const steps: Steps = [
    { title: "はじめに" },
    { title: "プロフィール" },
    { title: "通知" },
  ];

  const { activeStep, onStepNext, onStepPrev } = useSteps({
    index: 0,
    count: steps.length,
  });

  return (
    <>
      <Stepper
        colorScheme="green"
        index={activeStep}
        steps={steps}
        size={{ base: "lg", md: "sm" }}
        w={{ base: "4xl", md: "sm" }}
        orientation="horizontal"
        mb={6}
      />
      {renderItem({ onStepNext, onStepPrev })[activeStep]}
    </>
  );
};

export default RegistrationStepper;

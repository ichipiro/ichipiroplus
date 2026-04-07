"use client";

import { DownloadIcon, Share2Icon, XIcon } from "@yamada-ui/lucide";
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  }
}

const DISMISS_KEY = "ichipiroplus:pwa-install-dismissed-until";
const DISMISS_DAYS = 7;

const isStandaloneDisplayMode = () => {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
};

const isIosSafari = () => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

  return isIos && isSafari;
};

const getDismissedUntil = () => {
  if (typeof window === "undefined") return 0;

  const rawValue = window.localStorage.getItem(DISMISS_KEY);
  const timestamp = rawValue ? Number(rawValue) : 0;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const setDismissedUntil = () => {
  if (typeof window === "undefined") return;

  const nextTimestamp = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(nextTimestamp));
};

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const canShowIosInstructions = useMemo(() => isIosSafari(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsInstalled(isStandaloneDisplayMode());
    setIsReady(getDismissedUntil() <= Date.now());

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!isReady || isInstalled) return;
    if (!deferredPrompt && !canShowIosInstructions) return;

    const timerId = window.setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [canShowIosInstructions, deferredPrompt, isInstalled, isReady]);

  const handleDismiss = () => {
    setDismissedUntil();
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsVisible(false);
      } else {
        setDismissedUntil();
        setIsVisible(false);
      }
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <Box
      position="fixed"
      right={{ base: 4, md: 3 }}
      left={{ base: "auto", md: 3 }}
      bottom={{ base: 4, md: "6.5rem" }}
      zIndex={120}
      w={{ base: "22rem", md: "auto" }}
      maxW="calc(100vw - 2rem)"
      borderWidth="1px"
      borderRadius="xl"
      bg={["white", "gray.800"]}
      shadow="xl"
      px={4}
      py={4}
    >
      <HStack align="start" gap={3}>
        <Box
          mt={0.5}
          p={1}
          borderRadius="full"
          bg={["white", "gray.700"]}
          borderWidth="1px"
          flexShrink={0}
        >
          <Image
            src="/icon.png"
            alt="Ichipiro+"
            boxSize="2.25rem"
            borderRadius="full"
          />
        </Box>

        <VStack align="stretch" gap={2} flex={1} minW={0}>
          <Text fontWeight="bold">アプリとして使えます</Text>

          <Text fontSize="sm" color="gray.600">
            {canShowIosInstructions
              ? "Safari の共有メニューから「ホーム画面に追加」を選ぶと、Ichipiro+をアプリのように使えます。"
              : "ホーム画面に追加すると、Ichipiro+をアプリのようにすぐ開けます。"}
          </Text>

          <HStack justify="flex-end" gap={2} pt={1} wrap="wrap">
            {deferredPrompt && (
              <Button
                size="sm"
                colorScheme="primary"
                borderRadius="full"
                leftIcon={
                  <Icon
                    as={canShowIosInstructions ? Share2Icon : DownloadIcon}
                  />
                }
                loading={isInstalling}
                onClick={handleInstall}
              >
                インストール
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              onClick={handleDismiss}
            >
              あとで
            </Button>
          </HStack>
        </VStack>

        <Button
          aria-label="PWA案内を閉じる"
          size="xs"
          variant="ghost"
          minW="auto"
          px={2}
          onClick={handleDismiss}
        >
          <Icon as={XIcon} />
        </Button>
      </HStack>
    </Box>
  );
};

export default PwaInstallPrompt;

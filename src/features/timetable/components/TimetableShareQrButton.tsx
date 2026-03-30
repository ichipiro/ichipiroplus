"use client";

import { QrCodeIcon } from "@yamada-ui/lucide";
import { QRCodeSVG } from "qrcode.react";
import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Text,
  VStack,
  useDisclosure,
} from "@yamada-ui/react";
import { useEffect, useState } from "react";

type TimetableShareQrButtonProps = {
  sharePath: string;
  isPublic: boolean;
  buttonLabel?: string;
};

const TimetableShareQrButton = ({
  sharePath,
  isPublic,
  buttonLabel = "QRコードを表示",
}: TimetableShareQrButtonProps) => {
  const { open, onOpen, onClose } = useDisclosure();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setShareUrl(new URL(sharePath, window.location.origin).toString());
  }, [sharePath]);

  const handleCopy = async () => {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        leftIcon={<QrCodeIcon />}
        onClick={onOpen}
      >
        {buttonLabel}
      </Button>

      <Dialog open={open} onClose={onClose}>
        <DialogBody>
          <DialogHeader>時間割共有QRコード</DialogHeader>

          <VStack align="stretch" gap={4}>
            {isPublic ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  このQRコードを読み取ると、共有用の時間割ページを開けます。
                </Text>

                {shareUrl && (
                  <Box
                    mx="auto"
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                  >
                    <QRCodeSVG
                      value={shareUrl}
                      size={280}
                      marginSize={2}
                      title="時間割共有QRコード"
                    />
                  </Box>
                )}

                <Input value={shareUrl} readOnly />
              </>
            ) : (
              <Text color="gray.600">
                この時間割は現在非公開です。共有する場合は、設定画面で時間割を公開してください。
              </Text>
            )}

            <DialogFooter px={0}>
              {isPublic && (
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? "コピーしました" : "共有URLをコピー"}
                </Button>
              )}
              <Button onClick={onClose}>閉じる</Button>
            </DialogFooter>
          </VStack>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default TimetableShareQrButton;

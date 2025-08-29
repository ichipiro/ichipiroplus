import { uploadImage } from "@/features/article/actions";
import useActionFeedback from "@/hooks/useActionFeedback";
import { XIcon } from "@yamada-ui/lucide";
import {
  Avatar,
  Box,
  Center,
  FormControl,
  IconButton,
  Input,
  Skeleton,
} from "@yamada-ui/react";
import { useTransition } from "react";
import { type Control, useController } from "react-hook-form";
import type { UserFormData } from "../types";

interface IconUploadFieldProps {
  control: Control<UserFormData>;
  errorMessage?: string;
  label?: string;
  username: string;
  defaultValue?: string;
}

const IconUploadField = ({
  control,
  username,
  defaultValue,
  errorMessage,
}: IconUploadFieldProps) => {
  const [isPending, startTransition] = useTransition();
  const { withFeedback } = useActionFeedback();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name: "image",
    control,
    defaultValue: defaultValue || null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルタイプのバリデーション
    if (!file.type.startsWith("image/")) {
      const { showError } = useActionFeedback();
      showError(new Error("画像ファイルを選択してください"));
      return;
    }

    // アップロード処理
    startTransition(async () => {
      // FileをBase64に変換
      const reader = new FileReader();
      const base64Promise = new Promise<string>(resolve => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const result = await withFeedback(
        uploadImage({
          base64,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
        {
          successMessage: "アイコンをアップロードしました",
        },
      );

      if (result) {
        onChange(result);
      }
    });
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  return (
    <FormControl label="アイコン" invalid={!!error} errorMessage={errorMessage}>
      <Box position="relative" w="full">
        <Center>
          <Avatar
            src={value || undefined}
            key={username + value}
            name={username}
            alt="アイコンプレビュー"
            boxSize="120px"
            objectFit="cover"
            borderRadius="full"
            border="3px solid"
            borderColor={["white", "black"]}
          >
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              position="absolute"
              opacity="0"
              w="full"
              h="full"
              top="0"
              left="0"
              cursor="pointer"
              disabled={isPending}
            />
          </Avatar>
        </Center>
        {value && (
          <IconButton
            aria-label="Remove image"
            position="absolute"
            top="-8px"
            right="-8px"
            size="sm"
            icon={<XIcon />}
            colorScheme="red"
            onClick={handleRemoveImage}
            boxShadow="md"
            zIndex="2"
            rounded="full"
          />
        )}
      </Box>

      {isPending && (
        <Center py={4}>
          <Skeleton h="20px" w="100px" />
        </Center>
      )}
    </FormControl>
  );
};

export default IconUploadField;

"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import { Check, CircleAlert, FileJson, Upload } from "@yamada-ui/lucide";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  HStack,
  Heading,
  List,
  ListItem,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useRef, useState, useTransition } from "react";
import {
  importLectureData,
  validateLectureData,
} from "../actions/lecture-import";
import type { ImportResult } from "../types";

export function LectureImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    dataCount?: number;
    errors?: string[];
  } | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { withFeedback, showError } = useActionFeedback();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".json")) {
      showError(new Error("JSONファイルを選択してください"));
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    setImportResult(null);

    // Validate the file
    startTransition(async () => {
      try {
        const text = await selectedFile.text();
        const result = await validateLectureData(text);
        setValidationResult(result);
      } catch (error) {
        showError(error as Error);
        setValidationResult({
          valid: false,
          errors: ["ファイルの読み込みに失敗しました"],
        });
      }
    });
  };

  const handleImport = async () => {
    if (!file || !validationResult?.valid) return;

    startTransition(async () => {
      try {
        const text = await file.text();
        const result = await withFeedback(importLectureData(text), {
          successMessage: "講義データのインポートが完了しました",
          errorTitle: "インポートに失敗しました",
        });
        setImportResult(result || null);
      } catch (error) {
        showError(error as Error);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isValidating = isPending && !validationResult;
  const isImporting = isPending && validationResult?.valid && !importResult;

  return (
    <Card>
      <CardHeader>
        <Heading size="md">講義データインポート</Heading>
      </CardHeader>
      <CardBody>
        <VStack gap={4} align="stretch">
          {/* File input */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              leftIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              isLoading={isValidating}
              loadingText="検証中..."
              colorScheme="primary"
            >
              JSONファイルを選択
            </Button>
            {file && (
              <HStack mt={2}>
                <FileJson size="sm" />
                <Text fontSize="sm">{file.name}</Text>
                <Badge colorScheme="blue" fontSize="xs">
                  {(file.size / 1024).toFixed(2)} KB
                </Badge>
              </HStack>
            )}
          </Box>

          {/* Validation result */}
          {validationResult && (
            <Alert
              status={validationResult.valid ? "success" : "error"}
              variant="subtle"
            >
              <CircleAlert />
              <Box ml={3}>
                <AlertTitle>
                  {validationResult.valid ? "検証成功" : "検証エラー"}
                </AlertTitle>
                {validationResult.valid ? (
                  <AlertDescription>
                    {validationResult.dataCount}件のデータをインポート可能です
                  </AlertDescription>
                ) : (
                  <Box>
                    <AlertDescription>
                      以下のエラーが見つかりました：
                    </AlertDescription>
                    <List mt={2} fontSize="sm">
                      {validationResult.errors?.slice(0, 5).map((error) => (
                        <ListItem key={error} color="red.600">
                          {error}
                        </ListItem>
                      ))}
                      {validationResult.errors &&
                        validationResult.errors.length > 5 && (
                          <ListItem color="red.600">
                            ...他 {validationResult.errors.length - 5}{" "}
                            件のエラー
                          </ListItem>
                        )}
                    </List>
                  </Box>
                )}
              </Box>
            </Alert>
          )}

          {/* Import button */}
          {validationResult?.valid && !importResult && (
            <HStack justify="flex-end">
              <Button variant="outline" onClick={handleReset}>
                キャンセル
              </Button>
              <Button
                colorScheme="success"
                leftIcon={<Check />}
                onClick={handleImport}
                isLoading={isImporting}
                loadingText="インポート中..."
              >
                インポート実行
              </Button>
            </HStack>
          )}

          {/* Import result */}
          {importResult && (
            <Box>
              <Alert
                status={importResult.success ? "success" : "error"}
                variant="subtle"
                mb={3}
              >
                <CircleAlert />
                <Box ml={3}>
                  <AlertTitle>
                    {importResult.success ? "インポート完了" : "インポート失敗"}
                  </AlertTitle>
                  <AlertDescription>{importResult.message}</AlertDescription>
                </Box>
              </Alert>

              {importResult.success && importResult.stats && (
                <VStack align="stretch" gap={2}>
                  <HStack>
                    <Text fontWeight="semibold">講義:</Text>
                    <Badge colorScheme="blue">
                      {importResult.stats.lectures}件
                    </Badge>
                  </HStack>
                  {importResult.stats.rooms && (
                    <HStack>
                      <Text fontWeight="semibold">教室:</Text>
                      <Badge colorScheme="green">
                        {importResult.stats.rooms}件
                      </Badge>
                    </HStack>
                  )}
                  {importResult.stats.teachers && (
                    <HStack>
                      <Text fontWeight="semibold">教員:</Text>
                      <Badge colorScheme="purple">
                        {importResult.stats.teachers}件
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <Box mt={3}>
                  <Text fontWeight="semibold" color="red.600">
                    エラー:
                  </Text>
                  <List fontSize="sm" mt={1}>
                    {importResult.errors.slice(0, 5).map((error) => (
                      <ListItem key={error} color="red.600">
                        {error}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider my={3} />
              <Button onClick={handleReset} variant="outline">
                新しいファイルをインポート
              </Button>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

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
  Input,
  List,
  ListItem,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useRef, useState, useTransition } from "react";
import {
  importLectureChunk,
} from "../actions/lecture-import";
import {
  type ImportResult,
  type LectureImportData,
  type LectureImportValidationResult,
  LectureImportSchema,
} from "../types";

interface LectureImporterProps {
  defaultAcademicYear: number;
}

export function LectureImporter({ defaultAcademicYear }: LectureImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [validatedItems, setValidatedItems] = useState<LectureImportData[]>([]);
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] =
    useState<LectureImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [academicYear, setAcademicYear] = useState(String(defaultAcademicYear));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showSuccess } = useActionFeedback();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".json")) {
      showError(new Error("JSONファイルを選択してください"));
      return;
    }

    setFile(selectedFile);
    setValidatedItems([]);
    setValidationResult(null);
    setImportResult(null);

    // Validate the file on the client to avoid large server-action payloads.
    startTransition(async () => {
      try {
        const text = await selectedFile.text();
        const raw = JSON.parse(text);

        if (!Array.isArray(raw)) {
          setValidationResult({
            valid: false,
            errors: ["データは配列形式である必要があります"],
          });
          return;
        }

        const errors: string[] = [];
        const items: LectureImportData[] = [];

        for (let i = 0; i < raw.length; i++) {
          const parsed = LectureImportSchema.safeParse(raw[i]);
          if (parsed.success) {
            items.push(parsed.data);
          } else {
            errors.push(
              `行 ${i + 1}: ${parsed.error.errors.map(e => e.message).join(", ")}`,
            );
          }
        }

        if (errors.length > 0) {
          setValidatedItems([]);
          setValidationResult({
            valid: false,
            errors,
          });
          return;
        }

        setValidatedItems(items);
        setValidationResult({
          valid: true,
          dataCount: items.length,
        });
      } catch (error) {
        showError(error as Error);
        setValidatedItems([]);
        setValidationResult({
          valid: false,
          errors: ["ファイルの読み込みに失敗しました"],
        });
      }
    });
  };

  const handleImport = async () => {
    if (!validationResult?.valid || validatedItems.length === 0) return;

    startTransition(async () => {
      try {
        const chunkSize = 50;
        let lectureCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < validatedItems.length; i += chunkSize) {
          const chunk = validatedItems.slice(i, i + chunkSize);
          const result = await importLectureChunk(chunk, Number(academicYear));

          if (result.lectureCount) {
            lectureCount += result.lectureCount;
          }
          if (result.errors?.length) {
            errors.push(...result.errors);
          }
          if (!result.success && !result.lectureCount) {
            setImportResult({
              success: false,
              message: result.message,
              lectureCount,
              errors,
            });
            return;
          }
        }

        const finalResult: ImportResult = {
          success: errors.length === 0,
          message:
            errors.length === 0
              ? `${lectureCount}件の講義データをインポートしました`
              : `${lectureCount}件の講義データをインポートしましたが、${errors.length}件失敗しました`,
          lectureCount,
          errors: errors.length > 0 ? errors : undefined,
        };

        setImportResult(finalResult);

        if (finalResult.success) {
          showSuccess("講義データのインポートが完了しました");
        }
      } catch (error) {
        showError(error as Error);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setValidatedItems([]);
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
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              対象年度
            </Text>
            <Input
              type="number"
              value={academicYear}
              onChange={event => setAcademicYear(event.target.value)}
              min={2000}
              max={2100}
              w={{ base: "full", md: "12rem" }}
            />
          </Box>

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
              loading={isValidating}
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
                      {validationResult.errors?.slice(0, 5).map(error => (
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
                loading={isImporting}
                loadingText="インポート中..."
                disabled={!academicYear.trim()}
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
                    {importResult.errors.slice(0, 5).map(error => (
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

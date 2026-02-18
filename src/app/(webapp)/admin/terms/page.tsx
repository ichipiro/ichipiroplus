import { deleteTerm } from "@/features/admin/actions/terms";
import { getCurrentTerm, getTerms } from "@/features/timetable/actions/terms";
import { checkAdminAccess } from "@/lib/admin";
import { Calendar, CircleCheckIcon, Trash2 } from "@yamada-ui/lucide";
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  HStack,
  Heading,
  IconButton,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";
import TermForm from "./_components/TermForm";

export const metadata: Metadata = {
  title: "学期管理",
  description: "学期・ターム期間の設定と管理",
};

export default async function AdminTermsPage() {
  await checkAdminAccess();

  const terms = await getTerms();
  const currentTerm = await getCurrentTerm();

  const handleDelete = async (formData: FormData) => {
    "use server";
    const termId = formData.get("termId") as string;
    await deleteTerm(termId);
  };

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">学期管理</Heading>
          <Text color="gray.600">学期・ターム期間の設定と管理</Text>
        </Box>
      </HStack>

      {/* 新規作成フォーム */}
      <TermForm />

      {/* 学期一覧 */}
      <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
        {terms.map(term => (
          <Card key={term.id}>
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <HStack>
                    <Calendar size="sm" />
                    <Heading size="sm">{term.name}</Heading>
                    {term.id === currentTerm.id && (
                      <Badge colorScheme="green" size="sm">
                        <CircleCheckIcon size="xs" />
                        現在
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    第{term.number}ターム
                  </Text>
                </VStack>

                <form action={handleDelete}>
                  <input type="hidden" name="termId" value={term.id} />
                  <IconButton
                    type="submit"
                    icon={<Trash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                  />
                </form>
              </HStack>
            </CardHeader>

            <CardBody>
              <VStack align="stretch" gap={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    期間
                  </Text>
                  <Text fontSize="sm">
                    {new Date(term.startDate).toLocaleDateString("ja-JP")} 〜{" "}
                    {new Date(term.endDate).toLocaleDateString("ja-JP")}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {terms.length === 0 && (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Calendar size="2xl" color="gray.300" />
            <Heading size="md" mt={4} color="gray.500">
              学期が設定されていません
            </Heading>
            <Text color="gray.500" mt={2}>
              上のフォームから学期を作成してください
            </Text>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}

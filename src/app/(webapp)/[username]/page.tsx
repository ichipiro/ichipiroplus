import { getUserArticles } from "@/features/article/actions";
import ArticlesList from "@/features/article/components/ArticleList";
import { getTimetableByUserId } from "@/features/timetable/actions/sharing";
import { getCurrentTerm, getTerms } from "@/features/timetable/actions/terms";
import CopyTimetableButton from "@/features/timetable/components/CopyTimetableButton";
import TimetableGrid from "@/features/timetable/components/TimetableGrid";
import UserTimetablePicker from "@/features/timetable/components/UserTimetablePicker";
import {
  getCurrentUserOptional,
  getUserByUsername,
} from "@/features/user/actions";
import ProfileHeader from "@/features/user/components/ProfileHeader";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
    termId?: string;
  }>;
}

const ProfilePage = async ({ params, searchParams }: ProfilePageProps) => {
  const { username } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [profileData, currentUser, terms, currentTerm] = await Promise.all([
    getUserByUsername(username),
    getCurrentUserOptional(),
    getTerms(),
    getCurrentTerm(),
  ]);

  if (!profileData) {
    notFound();
  }

  const activeTab =
    resolvedSearchParams?.tab === "timetable" ? "timetable" : "articles";
  const selectedTermId = terms.some(
    term => term.id === resolvedSearchParams?.termId,
  )
    ? String(resolvedSearchParams?.termId)
    : currentTerm.id;

  const isOwner = currentUser?.id === profileData.id;
  const canViewTimetable = isOwner || profileData.isTimetablePublic;
  const timetableData =
    activeTab === "timetable" && canViewTimetable
      ? await getTimetableByUserId({
          userId: profileData.id,
          includePrivate: isOwner,
          termId: selectedTermId,
        })
      : null;

  const articlesData = profileData.id
    ? await getUserArticles(profileData.id)
    : [];
  const articlesCount = Array.isArray(articlesData) ? articlesData.length : 0;

  const buildTabHref = (tab: "articles" | "timetable") => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (tab === "timetable") {
      params.set("termId", selectedTermId);
    }
    return `/${profileData.username}?${params.toString()}`;
  };

  return (
    <Box w="full" rounded="md">
      <ProfileHeader user={profileData} articlesCount={articlesCount} />

      <Card mt={6}>
        <CardHeader>
          <VStack align="start" gap={3}>
            <Heading size="md">コンテンツ</Heading>
            <ButtonGroup attached variant="outline">
              <Button
                as="a"
                href={buildTabHref("articles")}
                colorScheme={activeTab === "articles" ? "blue" : "gray"}
              >
                記事
              </Button>
              <Button
                as="a"
                href={buildTabHref("timetable")}
                colorScheme={activeTab === "timetable" ? "blue" : "gray"}
              >
                時間割
              </Button>
            </ButtonGroup>
          </VStack>
        </CardHeader>

        <CardBody>
          {activeTab === "articles" && (
            <ArticlesList
              data={{
                results: articlesData,
                count: articlesCount,
                next: null,
                previous: null,
              }}
              title={`${profileData.displayName || "ユーザー"}の記事`}
              emptyMessage="このユーザーはまだ記事を投稿していません"
            />
          )}

          {activeTab === "timetable" && (
            <VStack align="stretch" gap={4}>
              <Suspense
                fallback={
                  <Text fontSize="sm" color="gray.600">
                    タームを読み込み中...
                  </Text>
                }
              >
                <UserTimetablePicker
                  terms={terms.map(term => ({ id: term.id, name: term.name }))}
                  selectedTermId={selectedTermId}
                />
              </Suspense>

              {!isOwner && canViewTimetable && (
                <CopyTimetableButton
                  sourceUserId={profileData.id}
                  sourceDisplayName={
                    profileData.displayName || profileData.username
                  }
                  termId={selectedTermId}
                />
              )}

              {!canViewTimetable && (
                <Text color="gray.600">このユーザーの時間割は非公開です。</Text>
              )}

              {canViewTimetable &&
                timetableData &&
                timetableData.items.length === 0 && (
                  <Text color="gray.600">
                    このタームの登録講義はありません。
                  </Text>
                )}

              {canViewTimetable &&
                timetableData &&
                timetableData.items.length > 0 && (
                  <TimetableGrid
                    termId={selectedTermId}
                    readonly
                    targetUserId={profileData.id}
                  />
                )}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProfilePage;

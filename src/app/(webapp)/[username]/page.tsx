import SettingsTabSwitcher, {
  type SettingsTabItem,
} from "@/app/(webapp)/settings/_components/SettingsTabSwitcher";
import { getUserArticles } from "@/features/article/actions";
import ArticlesList from "@/features/article/components/ArticleList";
import SharedTimetableSection from "@/features/timetable/components/SharedTimetableSection";
import { getCurrentTerm, getTerms } from "@/features/timetable/actions/terms";
import {
  getCurrentUserOptional,
  getUserByUsername,
} from "@/features/user/actions";
import ProfileHeader from "@/features/user/components/ProfileHeader";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
} from "@yamada-ui/react";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
    termId?: string;
  }>;
}

const profileTabs: SettingsTabItem[] = [
  { key: "articles", label: "記事" },
  { key: "timetable", label: "時間割" },
];

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

  const articlesData = profileData.id
    ? await getUserArticles(profileData.id)
    : [];
  const articlesCount = Array.isArray(articlesData) ? articlesData.length : 0;

  return (
    <Box w="full" rounded="md">
      <ProfileHeader user={profileData} articlesCount={articlesCount} />

      <Card mt={6}>
        <CardHeader>
          <VStack align="start" gap={3}>
            <Heading size="md">コンテンツ</Heading>
            <Box
              w="full"
              overflowX="auto"
              css={{ WebkitOverflowScrolling: "touch" }}
            >
              <SettingsTabSwitcher
                tabs={profileTabs}
                activeTab={activeTab}
                extraParamsByTab={{
                  articles: { termId: undefined },
                  timetable: { termId: selectedTermId },
                }}
              />
            </Box>
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
            <SharedTimetableSection
              userId={profileData.id}
              displayName={profileData.displayName || profileData.username}
              isOwner={isOwner}
              isTimetablePublic={profileData.isTimetablePublic}
              selectedTermId={selectedTermId}
              terms={terms}
            />
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProfilePage;

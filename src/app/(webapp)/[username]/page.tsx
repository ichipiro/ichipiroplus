import { getUserArticles } from "@/features/article/actions";
import ArticlesList from "@/features/article/components/ArticleList";
import { getUserByUsername } from "@/features/user/actions";
import ProfileHeader from "@/features/user/components/ProfileHeader";
import { Box } from "@yamada-ui/react";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { username } = params;
  const profileData = await getUserByUsername(username);

  if (!profileData) {
    notFound();
  }

  const articlesData = profileData.username
    ? await getUserArticles(profileData.username)
    : [];
  const articlesCount = Array.isArray(articlesData) ? articlesData.length : 0;

  return (
    <Box w="full" rounded="md">
      {/* プロフィールヘッダー */}
      <ProfileHeader user={profileData} articlesCount={articlesCount} />

      {/* 記事一覧 */}
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
    </Box>
  );
};

export default ProfilePage;

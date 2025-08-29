import { getArticle } from "@/features/article/actions";
import ArticleEditor from "@/features/article/components/article-pages/ArticleEditor";
import { getCurrentUser } from "@/features/user/actions";
import { notFound } from "next/navigation";

interface ArticleEditPageProps {
  params: {
    username: string;
    slug: string;
  };
}

const ArticleEditPage = async ({ params }: ArticleEditPageProps) => {
  const { username, slug } = params;

  const userProfile = await getCurrentUser();

  if (!userProfile || userProfile.username !== username) {
    notFound();
  }

  const article = await getArticle(slug); // slugはIDとして使用

  if (!article) {
    notFound();
  }

  return <ArticleEditor article={article} user={userProfile} />;
};

export default ArticleEditPage;

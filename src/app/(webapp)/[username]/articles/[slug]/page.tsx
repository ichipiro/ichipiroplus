import { getArticle, getUserArticles } from "@/features/article/actions";
import ArticlesList from "@/features/article/components/ArticleList";
import ArticleViewer from "@/features/article/components/article-pages/ArticleViewer";
import { getCurrentUser, getUserByUsername } from "@/features/user/actions";
import { Separator } from "@yamada-ui/react";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { username, slug } = await params;

  const [article, author, currentUserProfile] = await Promise.all([
    getArticle(slug),
    getUserByUsername(username),
    getCurrentUser(),
  ]);

  if (!article || !author) {
    notFound();
  }

  // アクセス権のチェック
  if (
    !article.isPublished &&
    (!currentUserProfile || currentUserProfile.username !== username)
  ) {
    notFound();
  }

  const otherArticles = await getUserArticles(author.id);
  const relatedArticles = otherArticles
    .filter(a => a.id !== article.id)
    .slice(0, 4);

  const isAuthor =
    !!currentUserProfile && currentUserProfile.username === username;

  return (
    <>
      <ArticleViewer article={article} isAuthor={isAuthor} author={author} />

      {relatedArticles.length > 0 && (
        <>
          <Separator my={8} />
          <ArticlesList
            data={{
              results: relatedArticles,
              count: relatedArticles.length,
              next: null,
              previous: null,
            }}
            title="著者の他の記事"
          />
        </>
      )}
    </>
  );
};

export default ArticlePage;

import { getArticle, getUserArticles } from "@/features/article/actions";
import ArticlesList from "@/features/article/components/ArticleList";
import ArticleViewer from "@/features/article/components/article-pages/ArticleViewer";
import { getCurrentUser, getUserByUsername } from "@/features/user/actions";
import { Separator } from "@yamada-ui/react";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: {
    username: string;
    slug: string;
  };
}

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { username, slug } = params;

  const article = await getArticle(slug);
  const author = await getUserByUsername(username);

  if (!article || !author) {
    notFound();
  }

  const currentUserProfile = await getCurrentUser();

  // アクセス権のチェック
  if (
    !article.isPublished &&
    (!currentUserProfile || currentUserProfile.username !== username)
  ) {
    notFound();
  }

  let relatedArticles: (typeof article)[] = [];

  const otherArticles = await getUserArticles(author.id);
  relatedArticles = otherArticles.filter(a => a.id !== article.id).slice(0, 4);

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

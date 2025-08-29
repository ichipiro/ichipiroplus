import ArticleCreator from "@/features/article/components/article-pages/ArticleCreater";
import { getCurrentUser } from "@/features/user/actions";
import { redirect } from "next/navigation";

const CreateArticlePage = async () => {
  const userProfile = await getCurrentUser();

  if (!userProfile) {
    redirect("/auth/register");
  }

  return <ArticleCreator username={userProfile.username} />;
};

export default CreateArticlePage;

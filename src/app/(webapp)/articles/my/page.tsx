import { getMyArticles } from "@/features/article/actions";
import { getCurrentUser } from "@/features/user/actions";
import { redirect } from "next/navigation";
import MyArticlesClient from "./_components/MyArticlesClient";

const MyArticlesPage = async () => {
  const userProfile = await getCurrentUser();

  if (!userProfile) {
    redirect("/auth/register");
  }

  const articles = await getMyArticles();

  return (
    <MyArticlesClient articles={articles} profileId={userProfile.username} />
  );
};

export default MyArticlesPage;

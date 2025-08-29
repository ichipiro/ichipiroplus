import {
  getAllDepartments,
  getAllFaculties,
  getCurrentUser,
} from "@/features/user/actions";
import AccountSettings from "@/features/user/components/AccountSettings";
import DisplaySettings from "@/features/user/components/DisplaySettings";
import MyProfileEditForm from "@/features/user/components/MyProfileEditForm";
import NotificationSettings from "@/features/webpush/components/NotificationSettings";
import { redirect } from "next/navigation";

interface SettingsPageProps {
  searchParams: { tab?: string };
}

const SettingsPage = async ({ searchParams }: SettingsPageProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/register");
  }

  const departments = await getAllDepartments();
  const faculties = await getAllFaculties();

  const tab = searchParams.tab || "profile";

  return (
    <>
      {tab === "profile" && (
        <MyProfileEditForm
          departments={departments}
          faculties={faculties}
          user={user}
        />
      )}
      {tab === "account" && <AccountSettings />}

      {tab === "display" && <DisplaySettings />}

      {tab === "notification" && <NotificationSettings />}
    </>
  );
};

export default SettingsPage;

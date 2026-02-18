"use client";

import {
  CalendarIcon,
  CircleCheckIcon,
  HouseIcon,
  LibraryIcon,
  SettingsIcon,
} from "@yamada-ui/lucide";

export interface NavMenuItem {
  label: string;
  icon?: React.ReactNode;
  href: string;
  children?: NavMenuItem[];
}

export const getNavigationItems = (): NavMenuItem[] => {
  return [
    {
      label: "ホーム",
      icon: <HouseIcon />,
      href: "/dashboard",
    },
    {
      label: "時間割",
      icon: <CalendarIcon />,
      href: "/timetable",
      children: [
        {
          label: "講義検索",
          href: "/lectures",
        },
        {
          label: "講義追加",
          href: "/lectures/new",
        },
      ],
    },
    {
      label: "タスク",
      icon: <CircleCheckIcon />,
      href: "/tasks",
    },
    {
      label: "記事",
      icon: <LibraryIcon />,
      href: "/articles",
      children: [
        {
          label: "新規作成",
          href: "/articles/new",
        },
        {
          label: "自分の記事",
          href: "/articles/my",
        },
      ],
    },
    {
      label: "設定",
      icon: <SettingsIcon />,
      href: "/settings",
      children: [
        {
          label: "プロフィール設定",
          href: "/settings?tab=profile",
        },
        {
          label: "アカウント設定",
          href: "/settings?tab=account",
        },
        {
          label: "表示設定",
          href: "/settings?tab=display",
        },
        {
          label: "通知設定",
          href: "/settings?tab=notification",
        },
      ],
    },
  ];
};

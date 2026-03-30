import ArticleCard from "@/features/article/components/ArticleCard";
import { TaskStatus } from "@/features/task/types";
import { getCurrentTerm } from "@/features/timetable/actions/terms";
import { DAY_LABELS, TIMES } from "@/features/timetable/constant";
import { getMe } from "@/features/user/actions";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ExternalLinkIcon } from "@yamada-ui/lucide";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Separator,
  SimpleGrid,
  Text,
  Link as UiLink,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const EXTERNAL_LINKS = [
  {
    title: "くるぴろ",
    href: "https://kurupiro.ichipiro.net/",
    description: "大学に来るバスの時間を確認できます。",
  },
  {
    title: "いちぽる",
    href: "https://ichipol.g.hiroshima-cu.ac.jp/uprx/ShibbolethAuthServlet",
    description: "学内ポータルにアクセスします。",
  },
  {
    title: "IchipiroExploler",
    href: "https://ichipiro.net/",
    description: "Ichipiro+を開発しているサークルのホームページです。",
  },
  {
    title: "授業カレンダー",
    href: "https://www.hiroshima-cu.ac.jp/campuslife/c00048722/",
    description: "大学公式の授業日程を確認できます。",
  },
] as const;

const dayFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  weekday: "short",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const currentDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

const WEEKDAY_TO_DAY_NUMBER: Record<string, number> = {
  月: 1,
  火: 2,
  水: 3,
  木: 4,
  金: 5,
  土: 6,
  日: 7,
};

type DashboardRegistration = Prisma.RegistrationGetPayload<{
  include: {
    lecture: {
      select: {
        id: true;
        name: true;
        room: true;
        instructor: true;
        schedules: {
          select: {
            day: true;
            time: true;
          };
        };
      };
    };
  };
}>;

type TodayLecture = {
  period: number;
  registration?: DashboardRegistration;
};

const HeaderActionButton = ({
  href,
  children,
}: {
  href: string;
  children: string;
}) => (
  <Link href={href} style={{ textDecoration: "none", marginLeft: "auto" }}>
    <Button
      size="sm"
      variant="outline"
      colorScheme="primary"
      borderRadius="full"
    >
      {children}
    </Button>
  </Link>
);

const TodayLectureRow = ({
  lecture,
  termId,
  currentDayNumber,
}: {
  lecture: TodayLecture;
  termId: string;
  currentDayNumber: number;
}) => {
  const { period, registration } = lecture;

  if (!registration) {
    return (
      <Box borderWidth="1px" borderRadius="md" px={4} py={3}>
        <HStack align="center" justify="space-between" gap={4}>
          <Text fontWeight="bold" minW="3rem">
            {period}限
          </Text>
          <Text color="gray.500">登録済みの講義はありません</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <LinkBox
      position="relative"
      borderWidth="1px"
      borderRadius="md"
      px={4}
      py={3}
      _hover={{ borderColor: "primary.400", shadow: "sm" }}
    >
      <LinkOverlay
        href={`/timetable/${termId}/${(currentDayNumber - 1) * 5 + period}`}
        position="absolute"
        inset={0}
        aria-label={`${period}限の時間割を開く`}
      />
      <HStack align="center" justify="space-between" gap={4}>
        <Text fontWeight="bold" minW="3rem" color="inherit">
          {period}限
        </Text>
        <HStack flex={1} minW={0} justify="space-between" gap={4}>
          <Link
            href={`/lectures/${registration.lecture.id}`}
            style={{
              textDecoration: "none",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Text
              color="primary.500"
              fontWeight="semibold"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {registration.lecture.name}
            </Text>
          </Link>
          <Text
            fontSize="sm"
            color="gray.600"
            whiteSpace="nowrap"
            flexShrink={0}
          >
            {registration.lecture.room || "教室未設定"}
          </Text>
        </HStack>
      </HStack>
    </LinkBox>
  );
};

const DashboardPage = async () => {
  const userId = await getMe();
  const now = new Date();
  const currentDayLabel = dayFormatter.format(now);
  const currentDayNumber = WEEKDAY_TO_DAY_NUMBER[currentDayLabel] ?? 0;
  const term = await getCurrentTerm();

  const [registrations, upcomingTasks, latestArticles] = await Promise.all([
    prisma.registration.findMany({
      where: {
        userId,
        academicYear: term.academicYear,
        lecture: {
          lectureTerms: {
            some: { termNumber: term.number },
          },
        },
      },
      include: {
        lecture: {
          select: {
            id: true,
            name: true,
            room: true,
            instructor: true,
            schedules: {
              select: {
                day: true,
                time: true,
              },
            },
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.INCOMPLETE,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        registration: {
          select: {
            id: true,
            lecture: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const todayLectures = TIMES.map(time => {
    const registration = registrations.find(item =>
      item.lecture.schedules.some(
        schedule => schedule.day === currentDayNumber && schedule.time === time,
      ),
    );

    return {
      period: time,
      registration,
    };
  });

  const hasWeekdaySchedule = currentDayNumber >= 1 && currentDayNumber <= 5;

  return (
    <VStack align="stretch" gap={6} w="full">
      <Box>
        <Text color="gray.600">
          {currentDateFormatter.format(now)}の予定と更新をまとめています。
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 1 }} gap={6}>
        <Card>
          <CardHeader>
            <HStack align="start" gap={3} w="full">
              <Box flex={1} minW={0}>
                <Heading size="md">今日の時間割</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {hasWeekdaySchedule
                    ? `${DAY_LABELS[currentDayNumber]}曜日の1〜5限`
                    : "土日は通常授業の対象外です"}
                </Text>
              </Box>
              <HeaderActionButton href={`/timetable/${term.id}`}>
                時間割を見る
              </HeaderActionButton>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" gap={3}>
              {todayLectures.map(({ period, registration }) => (
                <Box key={period}>
                  <TodayLectureRow
                    lecture={{ period, registration }}
                    termId={term.id}
                    currentDayNumber={currentDayNumber}
                  />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <HStack align="start" gap={3}>
              <Box flex={1} minW={0}>
                <Heading size="md">タスク</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  未完了タスクを締切の近い順で表示します。期限なしも含みます。
                </Text>
              </Box>
              <HeaderActionButton href="/tasks">
                タスク管理へ
              </HeaderActionButton>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" gap={3}>
              {upcomingTasks.length === 0 && (
                <Text color="gray.500">
                  締切が設定された未完了タスクはありません。
                </Text>
              )}

              {upcomingTasks.map(task => (
                <Box
                  key={task.id}
                  borderWidth="1px"
                  borderRadius="md"
                  px={4}
                  py={3}
                >
                  <HStack justify="space-between" align="start" gap={4}>
                    <Box flex={1} minW={0}>
                      <Text fontWeight="semibold" lineClamp={2}>
                        {task.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {task.dueDate
                          ? `締切: ${dateFormatter.format(task.dueDate)}`
                          : "締切未設定"}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {task.registration?.lecture.name || "個人タスク"}
                      </Text>
                    </Box>
                    <Link href="/tasks" style={{ textDecoration: "none" }}>
                      <Button
                        size="xs"
                        variant="subtle"
                        colorScheme="primary"
                        borderRadius="full"
                      >
                        開く
                      </Button>
                    </Link>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <HStack align="start" gap={3} w="full">
            <Box flex={1} minW={0}>
              <Heading size="md">最新の記事</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                公開済みの記事から新しい順に表示しています。
              </Text>
            </Box>
            <HeaderActionButton href="/articles">記事一覧へ</HeaderActionButton>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          {latestArticles.length === 0 ? (
            <Text color="gray.500">まだ公開されている記事はありません。</Text>
          ) : (
            <SimpleGrid columns={{ base: 3, md: 1 }} gap={4}>
              {latestArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">学内・関連リンク</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            外部サービスへすぐ移動できます。
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 4, md: 1 }} gap={4}>
            {EXTERNAL_LINKS.map(linkItem => (
              <UiLink
                key={linkItem.href}
                href={linkItem.href}
                isExternal
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                <Box
                  h="full"
                  borderWidth="1px"
                  borderRadius="md"
                  px={4}
                  py={4}
                  _hover={{ shadow: "sm", borderColor: "primary.400" }}
                >
                  <HStack justify="space-between" align="start" mb={3}>
                    <Heading size="sm">{linkItem.title}</Heading>
                    <ExternalLinkIcon size="1rem" />
                  </HStack>
                  <Separator mb={3} />
                  <Text fontSize="sm" color="gray.600">
                    {linkItem.description}
                  </Text>
                </Box>
              </UiLink>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default DashboardPage;

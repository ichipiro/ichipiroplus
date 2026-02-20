import { signIn } from "@/lib/auth";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardHeader,
  Center,
  Code,
  Container,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@yamada-ui/react";

const LoginPage = async (props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) => {
  const isDev = process.env.NODE_ENV !== "production";
  const searchParams = await props.searchParams;

  return (
    <Container centerContent py={16}>
      <Card variant="outline" w="full" maxW="2xl" shadow="lg" overflow="hidden">
        <CardHeader
          bg="blue.500"
          p={6}
          color="white"
          bgGradient="linear(to-r, blue.400, purple.500)"
        >
          <Center>
            <VStack>
              <Heading size="xl" fontFamily="sans-serif">
                <Text as="span">I</Text>
                <Text as="span">chipiro+</Text>
              </Heading>
              <Text fontSize="sm">大学生活をスマートに管理</Text>
            </VStack>
          </Center>
        </CardHeader>

        {/* ログインフォーム部分 */}
        <VStack gap={6} p={8} align="stretch">
          <Box textAlign="center">
            <Heading size="md" mb={2}>
              アカウントにログイン
            </Heading>
            <Text color="gray.500" fontSize="sm">
              アカウントにログインして、時間割管理や学習記録を始めましょう
            </Text>
          </Box>

          <Alert status="warning">
            <AlertIcon />

            <AlertDescription>
              メールアドレスのドメインが<Code>@*.hiroshima-cu.ac.jp</Code>
              のアカウントしかログインできません。
            </AlertDescription>
          </Alert>

          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id", {
                redirectTo: searchParams.callbackUrl ?? "",
              });
            }}
          >
            <Button type="submit" w="full" colorScheme="blue" size="lg">
              Microsoftアカウントでログイン
            </Button>
          </form>

          {isDev && (
            <>
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  開発環境用ログインです。`prisma/seed/data/test-users.json`
                  で設定したテストアカウントのみ利用できます。
                </AlertDescription>
              </Alert>

              <form
                action={async formData => {
                  "use server";
                  const email = String(formData.get("email") ?? "");
                  const password = String(formData.get("password") ?? "");

                  await signIn("credentials", {
                    email,
                    password,
                    redirectTo: searchParams.callbackUrl ?? "",
                  });
                }}
              >
                <VStack gap={3} align="stretch">
                  <Input
                    name="email"
                    type="email"
                    placeholder="テスト用メール"
                  />
                  <Input
                    name="password"
                    type="password"
                    placeholder="パスワード"
                  />
                  <Button type="submit" w="full" variant="outline">
                    開発環境用ログイン
                  </Button>
                </VStack>
              </form>
            </>
          )}

          <Text fontSize="xs" color="gray.500" textAlign="center">
            ログインすることで、
            <Link href="/terms">利用規約</Link>
            および<Link href="/privacy">プライバシーポリシー</Link>
            に同意したことになります。
          </Text>
        </VStack>
      </Card>
    </Container>
  );
};

export default LoginPage;

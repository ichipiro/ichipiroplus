import {
  Card,
  CardBody,
  CardHeader,
  DecimalList,
  Heading,
  ListItem,
  Tag,
  Text,
} from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Ichipiro+",
  description: "Ichipiro+のプライバシーポリシーについて説明しています。",
};

const PrivacyPolicyPage = () => {
  return (
    <Card maxW="5xl" variant="outline" p="md" alignSelf="center">
      <CardHeader>
        <Heading as="h1" size="2xl" mb={8}>
          プライバシーポリシー
        </Heading>
      </CardHeader>

      <CardBody>
        <Text>最終更新日: 2026年3月14日</Text>

        <Heading as="h2" size="xl">
          1. 基本方針
        </Heading>

        <Text>
          Ichipiro+（以下「当サービス」）は、サービス提供に必要な範囲でユーザー情報を取得し、適切に取り扱います。本ポリシーでは、取得する情報、利用目的、第三者提供、その他の取扱いについて説明します。
        </Text>
        <Text mt="sm">
          <Tag colorScheme="danger" variant="solid" mr="sm">
            注意
          </Tag>
          当サービスは広島市立大学公認サークル「いちぴろ・エクスプローラ」が運営する非公式サービスです。広島市立大学その他の教育機関の公式サービスではありません。
        </Text>

        <Heading as="h2" size="xl">
          2. 取得する情報
        </Heading>

        <Text>当サービスでは、以下の情報を取得することがあります。</Text>

        <Heading as="h3" size="md">
          アカウント情報
        </Heading>

        <Text>
          外部認証により取得する識別情報、氏名、メールアドレス、プロフィール画像、ユーザー名、表示名、学部・学科・学年など、アカウントやプロフィールに関する情報
        </Text>

        <Heading as="h3" size="md">
          利用データ
        </Heading>

        <Text>
          時間割、講義登録情報、タスク、記事、プロフィール本文、通知設定、時間割公開設定など、ユーザーが当サービス上で登録または作成した情報
        </Text>

        <Heading as="h3" size="md">
          技術情報
        </Heading>

        <Text>
          利用端末、ブラウザ、IPアドレス、アクセス日時、エラーログ、セッション情報など、サービス運営上必要な技術情報
        </Text>

        <Heading as="h3" size="md">
          通知関連情報
        </Heading>

        <Text>
          Web
          Push通知を利用する場合、通知の購読情報、通知設定、通知送信履歴などの情報
        </Text>

        <Heading as="h2" size="xl">
          3. 利用目的
        </Heading>

        <Text>取得した情報は、以下の目的で利用します。</Text>
        <DecimalList>
          <ListItem>ログイン、アカウント管理、各機能の提供のため</ListItem>
          <ListItem>
            時間割、講義、記事、タスク、通知等の機能を提供するため
          </ListItem>
          <ListItem>サービス改善、障害対応、不正利用防止のため</ListItem>
          <ListItem>ユーザーからの問い合わせに対応するため</ListItem>
          <ListItem>重要なお知らせを通知するため</ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          4. 外部サービスの利用
        </Heading>

        <Text>
          当サービスは、認証、データ保存、画像保存、通知配信その他の運営に必要な範囲で、外部サービスを利用することがあります。これらの外部サービスに対して必要な情報を送信する場合があります。
        </Text>

        <Heading as="h2" size="xl">
          5. 第三者提供
        </Heading>

        <Text>
          当サービスは、次の場合を除き、個人情報を第三者に提供しません。
        </Text>
        <DecimalList>
          <ListItem>ユーザー本人の同意がある場合</ListItem>
          <ListItem>法令に基づき開示が必要な場合</ListItem>
          <ListItem>
            サービス提供に必要な外部委託先・基盤事業者に提供する場合
          </ListItem>
          <ListItem>事業承継に伴って引き継ぐ場合</ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          6. 公開情報
        </Heading>

        <Text>
          ユーザーが公開設定を有効にしたプロフィール、記事、時間割その他の情報は、当サービス上で他のユーザーに表示されることがあります。
        </Text>

        <Heading as="h2" size="xl">
          7. Cookie等の利用
        </Heading>

        <Text>
          当サービスでは、ログイン状態の維持や表示改善のためにCookie、ローカルストレージその他これに類する技術を利用することがあります。
        </Text>

        <Heading as="h2" size="xl">
          8. 保持期間
        </Heading>

        <Text>
          取得した情報は、サービス提供に必要な期間、法令上必要な期間、または運営上合理的に必要な期間保持します。
        </Text>

        <Heading as="h2" size="xl">
          9. 安全管理
        </Heading>

        <Text>
          当サービスは、不正アクセス、紛失、漏えい等の防止に努めます。ただし、インターネット上の通信や保存方法に絶対的な安全性はありません。
        </Text>

        <Heading as="h2" size="xl">
          10. ポリシーの変更
        </Heading>

        <Text>
          当サービスは、必要に応じて本ポリシーを変更できます。変更後のポリシーは、当サービス上に掲載した時点または別途定める時点から効力を生じます。
        </Text>

        <Heading as="h2" size="xl">
          11. お問い合わせ
        </Heading>

        <Text>本ポリシーに関するお問い合わせは以下までお願いします。</Text>
        <Text>メール: main@ichipiroplus.com</Text>
      </CardBody>
    </Card>
  );
};

export default PrivacyPolicyPage;

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
  title: "利用規約 | Ichipiro+",
  description: "Ichipiro+の利用規約について説明しています。",
};

const TermsOfServicePage = () => {
  return (
    <Card maxW="5xl" variant="outline" p="md" alignSelf="center">
      <CardHeader>
        <Heading as="h1" size="2xl" mb={8}>
          利用規約
        </Heading>
      </CardHeader>

      <CardBody>
        <Text>最終更新日: 2026年3月14日</Text>

        <Heading as="h2" size="xl">
          1. 本規約について
        </Heading>

        <Text>
          この利用規約（以下「本規約」）は、Ichipiro+（以下「当サービス」）の利用条件を定めるものです。ユーザーは、当サービスを利用することで本規約に同意したものとみなされます。
        </Text>
        <Text mt="sm">
          <Tag colorScheme="danger" variant="solid" mr="sm">
            重要
          </Tag>
          当サービスは広島市立大学公認サークル「いちぴろ・エクスプローラ」が運営する非公式サービスです。広島市立大学その他の教育機関の公式サービスではありません。講義、学期、履修その他の重要事項は、必ず大学の公式情報も確認してください。
        </Text>

        <Heading as="h2" size="xl">
          2. 提供する機能
        </Heading>

        <Text>当サービスでは、主に以下の機能を提供します。</Text>
        <DecimalList>
          <ListItem>時間割の登録・管理・共有</ListItem>
          <ListItem>タスクの登録・管理</ListItem>
          <ListItem>講義情報の閲覧・検索</ListItem>
          <ListItem>記事の作成・公開</ListItem>
          <ListItem>通知機能その他これらに付随する機能</ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          3. アカウント
        </Heading>

        <Text>
          当サービスは外部認証を利用してログイン機能を提供します。認証時に利用する外部サービスの取扱いは、当該事業者の規約やポリシーにも従います。
        </Text>
        <DecimalList>
          <ListItem>
            アカウントの利用はユーザー本人の責任で行ってください。
          </ListItem>
          <ListItem>登録情報は、正確かつ最新の内容に保ってください。</ListItem>
          <ListItem>
            他人になりすます行為や第三者のアカウント利用は禁止します。
          </ListItem>
          <ListItem>
            不正利用が確認された場合、当サービスはアカウントまたは機能の利用を制限できるものとします。
          </ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          4. 禁止事項
        </Heading>

        <Text>
          ユーザーは、当サービスの利用にあたり、以下の行為を行ってはいけません。
        </Text>
        <DecimalList>
          <ListItem>法令または公序良俗に反する行為</ListItem>
          <ListItem>
            不正アクセス、過度な負荷の送信、脆弱性探索その他運営を妨げる行為
          </ListItem>
          <ListItem>
            他者の著作権、プライバシー、名誉その他の権利を侵害する行為
          </ListItem>
          <ListItem>虚偽情報の登録、なりすまし、詐欺的行為</ListItem>
          <ListItem>スパム、広告、勧誘その他これに類する行為</ListItem>
          <ListItem>マルウェアや有害なコードの送信</ListItem>
          <ListItem>当サービスが不適切と判断する行為</ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          5. 投稿コンテンツと公開情報
        </Heading>

        <Text>
          ユーザーは、記事、プロフィール、時間割、講義情報その他の情報を登録できます。公開設定がある機能については、ユーザーが公開した内容は他のユーザーから閲覧される場合があります。
        </Text>
        <DecimalList>
          <ListItem>
            投稿した内容については、投稿者自身が責任を負うものとします。
          </ListItem>
          <ListItem>
            投稿内容の権利は原則として投稿者に帰属しますが、当サービスの提供、表示、保存、改善のために必要な範囲で利用できるものとします。
          </ListItem>
          <ListItem>
            本規約に違反する内容や運営上問題があると判断した内容は、予告なく非表示、削除、編集制限の対象とすることがあります。
          </ListItem>
        </DecimalList>

        <Text>特に以下の内容の投稿は禁止します。</Text>
        <DecimalList>
          <ListItem>他者の権利を侵害する内容</ListItem>
          <ListItem>違法、有害、脅迫的、差別的、侮辱的な内容</ListItem>
          <ListItem>プライバシーを侵害する内容</ListItem>
          <ListItem>虚偽または誤解を招く内容</ListItem>
          <ListItem>スパムまたは過度な勧誘</ListItem>
          <ListItem>マルウェアを含む内容</ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          6. 講義情報・時間割情報の取扱い
        </Heading>

        <Text>
          当サービスに掲載される講義情報や時間割情報は、利便性向上のために提供するものであり、正確性、完全性、最新性を保証するものではありません。登録、履修、出席等の判断は、必ず大学の公式情報に基づいて行ってください。
        </Text>

        <Heading as="h2" size="xl">
          7. 知的財産権
        </Heading>

        <DecimalList>
          <ListItem>
            当サービスのロゴ、デザイン、プログラムその他運営側が作成したコンテンツに関する権利は、運営者または権利者に帰属します。
          </ListItem>
          <ListItem>
            法令上認められる場合を除き、当サービス上のコンテンツを運営者または権利者の許可なく利用してはいけません。
          </ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          8. サービスの変更・停止
        </Heading>

        <DecimalList>
          <ListItem>
            当サービスは、予告なく機能追加、変更、停止または終了を行うことがあります。
          </ListItem>
          <ListItem>
            当サービスは、本規約違反その他運営上必要がある場合、アカウントまたは一部機能の利用を制限することがあります。
          </ListItem>
          <ListItem>
            サービスの変更、停止または終了により生じた損害について、運営者は責任を負いません。
          </ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          9. 免責事項
        </Heading>

        <DecimalList>
          <ListItem>
            当サービスは現状有姿で提供され、継続性、可用性、完全性、正確性その他一切の保証を行いません。
          </ListItem>
          <ListItem>
            当サービスの利用または利用不能により生じた損害について、運営者は責任を負いません。
          </ListItem>
          <ListItem>
            ユーザー間または第三者との紛争は、当事者間で解決するものとします。
          </ListItem>
        </DecimalList>

        <Heading as="h2" size="xl">
          10. 規約の変更
        </Heading>

        <Text>
          当サービスは、必要に応じて本規約を変更できます。変更後の規約は、当サービス上に掲載した時点または別途定める時点から効力を生じます。
        </Text>

        <Heading as="h2" size="xl">
          11. お問い合わせ
        </Heading>

        <Text>本規約に関するお問い合わせは以下までお願いします。</Text>
        <Text>メール: main@ichipiroplus.com</Text>
      </CardBody>
    </Card>
  );
};

export default TermsOfServicePage;

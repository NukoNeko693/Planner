import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";

export default async function SchoolGuidePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">学校案内</h1>
      <p className="mt-2 text-slate-600">
        セルマネに掲載されている学校情報です。
      </p>

      <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-blue-700">学校の理念</p>
        <h2 className="mt-1 text-2xl font-bold">建学の精神</h2>
        <p className="mt-2 text-lg">国家・社会を担う人物の育成</p>
        <h3 className="mt-6 text-xl font-bold">校訓</h3>
        <p className="mt-2">真面目に　強く　上品に</p>
        <h3 className="mt-6 text-xl font-bold">教育理念</h3>
        <p className="mt-2">「知・徳・体」の調和の取れた全人教育</p>
        <h3 className="mt-6 text-xl font-bold">スクールミッション</h3>
        <p className="mt-2 font-semibold">
          Developing Future Leaders With A Global Mindset
        </p>
        <p className="mt-1 text-sm text-slate-600">
          卓越した語学力や国際的な視野を持って、世界を舞台に活躍できる次世代のリーダーを育成する。
        </p>
        <h3 className="mt-6 text-xl font-bold">教育スローガン</h3>
        <p className="mt-2 font-semibold">
          Keep Traditional Values, Inspire Innovative Spirit
        </p>
        <p className="mt-1 text-sm text-slate-600">
          伝統的な価値観を大切にし、革新的な気概を鼓吹する。
        </p>
        <h3 className="mt-6 text-xl font-bold">目指すリーダー像</h3>
        <p className="mt-2 font-semibold">
          A Leading Creator of Sustainable Societies with Great Ambitions
        </p>
        <p className="mt-1 text-sm text-slate-600">
          高い志を持った持続可能な社会の中心的創造者。
        </p>
        <h3 className="mt-6 text-xl font-bold">育てたい「10の資質」</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <Trait
            title="個人の能力や思考"
            items={[
              "全体を見渡して判断し、主体的に行動する力",
              "論理的に思考し、日本語および英語で表現する力",
              "自己管理能力",
              "創造性",
            ]}
          />
          <Trait
            title="他者との関係"
            items={[
              "多様な他者を理解し思いやる力",
              "コミュニケーション力",
              "コラボレーション力（チームワーク）",
            ]}
          />
          <Trait
            title="社会や文化との関係"
            items={[
              "国際社会の持続的発展や平和に貢献しようとする意志",
              "日本の伝統・文化を尊重する心",
              "倫理観",
            ]}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-amber-700">学校生活</p>
        <h2 className="mt-1 text-2xl font-bold">高槻高等学校学則（抜粋）</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Rule
            title="目的"
            text="教育基本法および学校教育法に基づき、高等普通教育を施して国家・社会を担う心身ともに健全な人材を育成します。"
          />
          <Rule
            title="学年・学期"
            text="学年は4月1日から翌年3月31日まで。第1学期は4月1日〜7月31日、第2学期は8月1日〜12月31日、第3学期は翌年1月1日〜3月31日です。"
          />
          <Rule
            title="休業日"
            text="国民の祝日、日曜日、夏期・冬期・春期休業日、創立記念日などを休業日とします。教育上必要な場合は変更されることがあります。"
          />
          <Rule
            title="授業・評価"
            text="年間授業日数は210日以上、週1時間の授業を1単位とします。学習評価は5段階評定と100点法を併用します。"
          />
          <Rule
            title="転学・退学・休学"
            text="転学、退学、休学などには、保護者等と連署した願い出と校長の許可が必要です。"
          />
          <Rule
            title="賞罰"
            text="成績・性行が優れ模範となる場合は褒賞があります。規則違反等には訓戒、訓告、謹慎、停学、退学などの懲戒があります。"
          />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          この画面は写真に掲載された学則の要約です。正式な手続きや判断には原本を確認してください。
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-700">困ったときに</p>
        <h2 className="mt-1 text-2xl font-bold">生徒相談窓口</h2>
        <h3 className="mt-5 text-lg font-bold">学校内・生徒相談室</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
          <li>
            スクールカウンセラー、保健室・保健指導部の先生が対応します。誰に相談するかは自分で決められます。
          </li>
          <li>相談室は中学校舎1階、保健室の隣にあります。</li>
          <li>スクールカウンセラーは週2〜3回来校します。</li>
          <li>
            相談内容の秘密は守られ、相談によって成績や評価が悪くなることはありません。
          </li>
          <li>
            担任、学年団、保健室、顧問など、相談しやすい先生に相談できます。
          </li>
        </ul>
        <h3 className="mt-6 text-lg font-bold">学校外の相談先</h3>
        <div className="mt-3 space-y-3">
          <Contact
            name="大阪府教育センター 教育相談・子どもからの相談"
            detail="06-6607-7361 / sukoyaka@edu.osaka-c.ed.jp"
          />
          <Contact
            name="大阪府教育センター 教育相談・保護者からの相談"
            detail="06-6607-7362 / sawayaka@edu.osaka-c.ed.jp"
          />
          <Contact
            name="すこやか教育相談24（24時間対応）"
            detail="0120-0-78310"
          />
          <Contact
            name="チャイルドライン支援センター（18歳まで）"
            detail="https://childline.or.jp/"
          />
          <Contact
            name="大阪府インターネット誹謗中傷・トラブル相談窓口 ネットハーモニー"
            detail="https://net-harmony.pref.osaka.lg.jp/"
          />
        </div>
      </section>
    </main>
  );
}

function Trait({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-blue-50 p-4">
      <h4 className="font-bold">{title}</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
function Rule({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-amber-100 p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
function Contact({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="rounded-xl bg-emerald-50 p-4">
      <p className="font-bold">{name}</p>
      <p className="mt-1 text-sm break-all text-slate-700">{detail}</p>
    </div>
  );
}

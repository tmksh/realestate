"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Eye, EyeOff, ImageOff, Send } from "lucide-react";
import { LinePreview } from "@/components/LinePreview";
import { Badge, Button, Card, Field, Select, Textarea } from "@/components/ui";
import {
  formatDateTime,
  formatPrice,
  formatYen,
  statusLabel,
  statusTone,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import type { BroadcastFormat, MaskableField } from "@/lib/types";

const maskOptions: Array<{ id: MaskableField; label: string }> = [
  { id: "addressDetail", label: "番地" },
  { id: "roomNumber", label: "部屋番号" },
  { id: "buildingName", label: "マンション名" },
  { id: "price", label: "価格" },
  { id: "managementFee", label: "管理費・積立" },
  { id: "ownerNote", label: "申し送り" },
];

const reviewSteps = [
  { n: "01", label: "内容を確認" },
  { n: "02", label: "目隠し" },
  { n: "03", label: "プレビュー" },
  { n: "04", label: "配信" },
];

export default function AdminPropertyReviewPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const property = state.properties.find((item) => item.id === params.id);

  if (!property) {
    return <p className="text-sm text-muted">物件が見つかりません。</p>;
  }

  return <ReviewEditor key={property.id} propertyId={property.id} />;
}

function ReviewEditor({ propertyId }: { propertyId: string }) {
  const navigate = useNavigate();
  const { state, updateReview, sendBroadcast, rejectProperty, addReaction } = useStore();
  const property = state.properties.find((item) => item.id === propertyId);
  const [maskedFields, setMaskedFields] = useState<MaskableField[]>(property?.maskedFields ?? []);
  const [broadcastFormat, setBroadcastFormat] = useState<BroadcastFormat>(
    property?.broadcastFormat ?? "bullets",
  );
  const [customMessage, setCustomMessage] = useState(property?.customMessage ?? "");
  const [rejectReason, setRejectReason] = useState("");
  const [sending, setSending] = useState(false);

  const preview = useMemo(() => {
    if (!property) return null;
    return { ...property, maskedFields, broadcastFormat, customMessage };
  }, [broadcastFormat, customMessage, maskedFields, property]);

  if (!property || !preview) {
    return <p className="text-sm text-muted">物件が見つかりません。</p>;
  }

  const toggleMask = (field: MaskableField) => {
    setMaskedFields((current) =>
      current.includes(field) ? current.filter((item) => item !== field) : [...current, field],
    );
  };

  const persistReview = () => {
    updateReview(property.id, { maskedFields, broadcastFormat, customMessage });
  };

  const alreadySent = property.status === "broadcasted";

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-x-8 lg:gap-y-6">
      <div className="order-1 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-slate-600">{property.companyName}</p>
              <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
            </div>
            <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
              {property.buildingName}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
              管理会社から届いた未公開物件です。内容を確認し、目隠ししたうえで公式LINEへ配信します。
            </p>
            <p className="mt-1.5 text-[13px] text-muted">
              管理会社からの送信日時：{formatDateTime(property.submittedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-[10px] border border-aqua-100 bg-aqua-50 px-5 py-3.5">
          <p className="text-[15px] font-semibold text-ink">ここで確認し、公式LINEへ配信します</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            左で目隠しと配信形式を選ぶと、右のプレビューに反映されます。
          </p>
          <p className="mt-2 text-[13px] leading-5 text-slate-500">
            デモ環境のため、実際の公式LINEには送信されません。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-slate-500">
            {reviewSteps.map((step, index) => (
              <span key={step.n} className="flex items-center gap-2">
                {index > 0 ? <span className="text-slate-300">→</span> : null}
                <span>
                  <span className="font-display text-aqua-700">{step.n}</span> {step.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-[170px] overflow-hidden bg-slate-100">
            {property.images[0] ? (
              <img
                src={property.images[0]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
                <ImageOff className="h-5 w-5" />
                <p className="text-[13px] font-medium">画像未設定</p>
              </div>
            )}
          </div>
          <div className="grid gap-2.5 p-5 sm:grid-cols-2">
            <Info
              label="所在地"
              value={`${property.prefecture}${property.city}${property.town}${property.addressDetail}`}
            />
            <Info label="部屋番号" value={`${property.roomNumber}号室`} />
            <Info label="間取り / 面積" value={`${property.layout} / ${property.area}㎡`} />
            <Info label="階" value={`${property.floor} / ${property.totalFloors}階建`} />
            <Info label="価格" value={formatPrice(property.price)} emphasize />
            <Info
              label="管理費 / 積立"
              value={`${formatYen(property.managementFee)} / ${formatYen(property.reserveFund)}`}
            />
            <Info label="最寄" value={`${property.station} 徒歩${property.walkMinutes}分`} />
            <Info label="築年" value={`${property.builtYear}年${property.builtMonth}月`} />
            <div className="sm:col-span-2">
              <p className="text-[13px] font-medium text-slate-500">アピールポイント</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14.5px] leading-[1.65] text-ink">
                {property.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {property.notes ? (
              <div className="sm:col-span-2 rounded-[8px] bg-slate-50 px-4 py-2.5">
                <p className="text-[13px] font-medium text-slate-500">管理会社からの申し送り</p>
                <p className="mt-1 text-sm leading-6 text-ink">{property.notes}</p>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div>
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-aqua-600" />
              <h2 className="text-[18px] font-bold text-ink">詳細の目隠し</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">配信時に隠す項目を選んでください。</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              変更内容は右のプレビューにすぐ反映されます。
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
            {maskOptions.map((option) => {
              const active = maskedFields.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleMask(option.id)}
                  className={`flex min-h-11 items-center justify-between gap-2 rounded-[8px] px-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-1 ${
                    active
                      ? "bg-aqua-50 text-aqua-700 hover:bg-aqua-100"
                      : "border border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 truncate font-medium">{option.label}</span>
                  <span
                    className={`flex shrink-0 items-center gap-1 text-[12px] font-semibold ${
                      active ? "text-aqua-700" : "text-slate-500"
                    }`}
                  >
                    {active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {active ? "非表示" : "表示"}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="配信形式" hint="会員に届く見せ方を選びます。">
            <Select
              value={broadcastFormat}
              onChange={(event) => setBroadcastFormat(event.target.value as BroadcastFormat)}
            >
              <option value="bullets">箇条書き</option>
              <option value="card">カード</option>
              <option value="pdf">PDF添付</option>
            </Select>
          </Field>
          <Field label="添えるメッセージ" hint="プレビュー末尾に追加されます。">
            <Textarea
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
              placeholder="気になる方はいいねを送ってください"
              className="min-h-[112px]"
            />
          </Field>
        </Card>
      </div>

      <div className="order-2 lg:row-span-2 lg:sticky lg:top-24">
        <div className="mb-4 text-center lg:text-left">
          <p className="text-sm font-semibold text-ink">会員に届く公式LINEイメージ</p>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            実際の送信結果ではなく、配信イメージです。
          </p>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            目隠し・配信形式・メッセージの変更がリアルタイムで反映されます。
          </p>
        </div>
        <LinePreview property={preview} />
      </div>

      <div className="order-3 space-y-6 lg:col-start-1">
        <Card className="space-y-4 p-6">
          {alreadySent ? (
            <p className="text-[13px] font-medium text-aqua-700">この物件は配信済みです。</p>
          ) : null}
          <p className="text-sm leading-6 text-ink">右のプレビューを確認してから配信してください。</p>
          <p className="text-[13px] leading-5 text-slate-500">
            デモ環境のため、実際の公式LINEには送信されません。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={persistReview} disabled={alreadySent} className="flex-1 whitespace-nowrap">
              確認内容を保存
            </Button>
            <Button
              variant="line"
              className="flex-1 whitespace-nowrap"
              disabled={alreadySent || sending}
              onClick={() => {
                persistReview();
                setSending(true);
                const broadcastId = sendBroadcast(property.id);
                const simulated = [
                  { reactionType: "like" as const },
                  { reactionType: "stamp" as const, stamp: "🏠" },
                  { reactionType: "like" as const },
                ];
                simulated.forEach((item, index) => {
                  window.setTimeout(() => {
                    addReaction({
                      propertyId: property.id,
                      broadcastId,
                      ...item,
                    });
                  }, 400 * (index + 1));
                });
                window.setTimeout(() => {
                  setSending(false);
                  navigate(`/admin/broadcasts/${broadcastId}`);
                }, 900);
              }}
            >
              <Send className="h-4 w-4" />
              {alreadySent ? "配信済み" : sending ? "配信中…" : "公式LINEで配信"}
            </Button>
          </div>
        </Card>

        {!alreadySent ? (
          <Card className="space-y-3 p-6">
            <h2 className="text-[18px] font-bold text-ink">差戻し</h2>
            <p className="text-[13px] leading-5 text-muted">
              物件情報の修正が必要なときに使います。LINEには配信されません。
            </p>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="価格の確認が必要、など"
              className="min-h-[112px]"
            />
            <Button
              variant="danger"
              disabled={!rejectReason}
              onClick={() => {
                rejectProperty(property.id, rejectReason);
                navigate("/admin/inbox");
              }}
            >
              管理会社へ差し戻す
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-slate-500">{label}</p>
      <p
        className={
          emphasize
            ? "mt-0.5 text-[18px] font-bold leading-snug text-ink"
            : "mt-0.5 text-[14.5px] font-medium leading-snug text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

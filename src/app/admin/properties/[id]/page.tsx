"use client";

import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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
              <p className="text-[13px] font-medium text-muted">{property.companyName}</p>
              <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
            </div>
            <h1 className="mt-1 font-display text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-[2rem]">
              {property.buildingName}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              管理会社からの送信日時：{formatDateTime(property.submittedAt)}
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-[300px] overflow-hidden bg-canvas md:h-[340px]">
            {property.images[0] ? (
              <img
                src={property.images[0]}
                alt=""
                className="property-photo absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-canvas text-faint">
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
              <p className="text-[13px] font-medium text-muted">アピールポイント</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14.5px] leading-[1.65] text-ink">
                {property.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {property.notes ? (
              <div className="sm:col-span-2 rounded-[16px] bg-canvas px-4 py-2.5">
                <p className="text-[13px] font-medium text-muted">管理会社からの申し送り</p>
                <p className="mt-1 text-sm leading-6 text-ink">{property.notes}</p>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div>
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted" />
              <h2 className="font-display text-[18px] font-bold tracking-[-0.03em] text-ink">詳細の目隠し</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">配信時に隠す項目を選んでください。</p>
            <p className="mt-1 text-[13px] leading-5 text-faint">
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
                  className={`flex min-h-11 items-center justify-between gap-2 rounded-[18px] px-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-1 ${
                    active
                      ? "bg-ink text-white hover:bg-ink-soft"
                      : "border border-hairline bg-white text-ink hover:bg-canvas"
                  }`}
                >
                  <span className="min-w-0 truncate font-medium">{option.label}</span>
                  <span
                    className={`flex shrink-0 items-center gap-1 text-[12px] font-medium ${
                      active ? "text-white" : "text-muted"
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
      </div>

      <div className="order-2">
        <div className="mb-4 text-center lg:text-left">
          <p className="text-sm font-semibold text-ink">配信イメージ</p>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            実際のトーク画面ではなく、送る内容から作った見本です。
          </p>
          <p className="mt-1 text-[13px] leading-5 text-faint">
            目隠し・配信形式・メッセージの変更がすぐに反映されます。
          </p>
        </div>
        <LinePreview property={preview} />
      </div>

      <div className="order-3 lg:col-span-2">
        <Card className="space-y-5 p-5 sm:p-6">
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
          <Field label="添えるメッセージ" hint="プレビュー末尾に追加されます。文章を読みやすい幅で入力できます。">
            <Textarea
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
              placeholder="気になる方はいいねを送ってください"
              className="min-h-[220px] px-4 py-3 leading-7"
            />
          </Field>
        </Card>
      </div>

      <div className="order-4 space-y-6 lg:col-span-2">
        <Card className="space-y-4 p-6">
          {alreadySent ? (
            <p className="text-[13px] font-medium text-ink">この物件は配信済みです。</p>
          ) : null}
          <p className="text-sm leading-6 text-ink">プレビューを確認してから配信してください。</p>
          <p className="text-[13px] leading-5 text-faint">
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
                  router.push(`/admin/broadcasts/${broadcastId}`);
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
            <h2 className="font-display text-[18px] font-bold tracking-[-0.03em] text-ink">差戻し</h2>
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
                router.push("/admin/inbox");
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
      <p className="text-[13px] font-medium text-muted">{label}</p>
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

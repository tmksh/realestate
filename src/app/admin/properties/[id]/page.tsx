"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeOff, Send } from "lucide-react";
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
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-aqua-700">{property.companyName}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {property.buildingName}
            </h1>
            <p className="mt-2 text-sm text-muted">送信：{formatDateTime(property.submittedAt)}</p>
          </div>
          <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
        </div>

        <Card className="overflow-hidden">
          {property.images[0] ? (
            <div
              className="h-56 bg-cover bg-center"
              style={{ backgroundImage: `url(${property.images[0]})` }}
            />
          ) : null}
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Info label="所在地" value={`${property.prefecture}${property.city}${property.town}${property.addressDetail}`} />
            <Info label="部屋番号" value={`${property.roomNumber}号室`} />
            <Info label="間取り / 面積" value={`${property.layout} / ${property.area}㎡`} />
            <Info label="階" value={`${property.floor} / ${property.totalFloors}階建`} />
            <Info label="価格" value={formatPrice(property.price)} />
            <Info label="管理費 / 積立" value={`${formatYen(property.managementFee)} / ${formatYen(property.reserveFund)}`} />
            <Info label="最寄" value={`${property.station} 徒歩${property.walkMinutes}分`} />
            <Info label="築年" value={`${property.builtYear}年${property.builtMonth}月`} />
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-muted">アピールポイント</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {property.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {property.notes ? (
              <div className="sm:col-span-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                申し送り：{property.notes}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-aqua-600" />
            <h2 className="font-display text-lg font-semibold">詳細の目隠し</h2>
          </div>
          <p className="text-sm text-muted">
            情報が詳しすぎないよう、配信時に隠す項目を選んでください。プレビューに即反映されます。
          </p>
          <div className="flex flex-wrap gap-2">
            {maskOptions.map((option) => {
              const active = maskedFields.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleMask(option.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    active ? "bg-aqua-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {active ? "非表示" : "表示"} ・ {option.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="配信形式">
              <Select
                value={broadcastFormat}
                onChange={(event) => setBroadcastFormat(event.target.value as BroadcastFormat)}
              >
                <option value="bullets">箇条書き</option>
                <option value="card">カード</option>
                <option value="pdf">PDF添付</option>
              </Select>
            </Field>
            <Field label="添えるメッセージ">
              <Textarea
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                placeholder="気になる方はいいねを送ってください"
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={persistReview} disabled={alreadySent}>
              確認内容を保存
            </Button>
            <Button
              variant="line"
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
            <h2 className="font-display text-lg font-semibold">差戻し</h2>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="価格の確認が必要、など"
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

      <div className="xl:sticky xl:top-24">
        <p className="mb-4 text-center text-sm font-semibold text-muted">会員に届く公式LINEイメージ</p>
        <LinePreview property={preview} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

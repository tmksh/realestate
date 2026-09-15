"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { nowIso } from "@/lib/format";
import { presetImages } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Property } from "@/lib/types";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";

export function PropertyForm({
  initial,
  mode,
}: {
  initial: Property;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const { saveProperty, submitProperty } = useStore();
  const [property, setProperty] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Property>(key: K, value: Property[K]) => {
    setProperty((current) => ({ ...current, [key]: value, updatedAt: nowIso() }));
    setSaved(false);
  };

  const persist = (nextStatus?: Property["status"]) => {
    const next = {
      ...property,
      name: property.name || `${property.buildingName} ${property.layout}`.trim(),
      highlights: property.highlights.map((item) => item.trim()).filter(Boolean),
      status: nextStatus ?? property.status,
      updatedAt: nowIso(),
    };
    saveProperty(next);
    setProperty(next);
    return next;
  };

  const canSubmit =
    property.buildingName &&
    property.city &&
    property.town &&
    property.station &&
    property.price > 0;

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const next = persist();
        setSaved(true);
        if (mode === "create") {
          router.push(`/company/properties/${next.id}`);
        }
      }}
    >
      <Card className="grid gap-5 p-6 md:grid-cols-2">
        <h2 className="font-display text-lg font-semibold md:col-span-2">基本情報</h2>
        <Field label="マンション名">
          <Input
            value={property.buildingName}
            onChange={(event) => update("buildingName", event.target.value)}
            placeholder="パークホームズ白金台"
            required
          />
        </Field>
        <Field label="物件名（管理用）">
          <Input
            value={property.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="パークホームズ白金台 3LDK"
          />
        </Field>
        <Field label="都道府県">
          <Input value={property.prefecture} onChange={(event) => update("prefecture", event.target.value)} />
        </Field>
        <Field label="市区町村">
          <Input value={property.city} onChange={(event) => update("city", event.target.value)} placeholder="港区" />
        </Field>
        <Field label="町名">
          <Input value={property.town} onChange={(event) => update("town", event.target.value)} placeholder="白金台" />
        </Field>
        <Field label="番地" hint="運営側で目隠しできます">
          <Input
            value={property.addressDetail}
            onChange={(event) => update("addressDetail", event.target.value)}
            placeholder="4-12-8"
          />
        </Field>
        <Field label="部屋番号" hint="詳細すぎる情報は配信時に非表示推奨">
          <Input
            value={property.roomNumber}
            onChange={(event) => update("roomNumber", event.target.value)}
            placeholder="1203"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="所在階">
            <Input
              type="number"
              value={property.floor}
              onChange={(event) => update("floor", Number(event.target.value))}
            />
          </Field>
          <Field label="階数">
            <Input
              type="number"
              value={property.totalFloors}
              onChange={(event) => update("totalFloors", Number(event.target.value))}
            />
          </Field>
        </div>
      </Card>

      <Card className="grid gap-5 p-6 md:grid-cols-3">
        <h2 className="font-display text-lg font-semibold md:col-span-3">物件スペック</h2>
        <Field label="間取り">
          <Select value={property.layout} onChange={(event) => update("layout", event.target.value)}>
            {["1K", "1DK", "1LDK", "2LDK", "3LDK", "4LDK"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="専有面積（㎡）">
          <Input
            type="number"
            step="0.1"
            value={property.area}
            onChange={(event) => update("area", Number(event.target.value))}
          />
        </Field>
        <Field label="向き">
          <Select value={property.direction} onChange={(event) => update("direction", event.target.value)}>
            {["南", "南東", "東", "南西", "西", "北"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="築年">
          <Input
            type="number"
            value={property.builtYear}
            onChange={(event) => update("builtYear", Number(event.target.value))}
          />
        </Field>
        <Field label="築月">
          <Input
            type="number"
            min={1}
            max={12}
            value={property.builtMonth}
            onChange={(event) => update("builtMonth", Number(event.target.value))}
          />
        </Field>
        <Field label="ペット">
          <Select
            value={property.petAllowed ? "yes" : "no"}
            onChange={(event) => update("petAllowed", event.target.value === "yes")}
          >
            <option value="no">不可</option>
            <option value="yes">可</option>
          </Select>
        </Field>
        <Field label="最寄駅">
          <Input
            value={property.station}
            onChange={(event) => update("station", event.target.value)}
            placeholder="白金台駅"
          />
        </Field>
        <Field label="徒歩（分）">
          <Input
            type="number"
            value={property.walkMinutes}
            onChange={(event) => update("walkMinutes", Number(event.target.value))}
          />
        </Field>
        <Field label="価格（万円）">
          <Input
            type="number"
            value={property.price}
            onChange={(event) => update("price", Number(event.target.value))}
          />
        </Field>
        <Field label="管理費（円/月）">
          <Input
            type="number"
            value={property.managementFee}
            onChange={(event) => update("managementFee", Number(event.target.value))}
          />
        </Field>
        <Field label="修繕積立金（円/月）">
          <Input
            type="number"
            value={property.reserveFund}
            onChange={(event) => update("reserveFund", Number(event.target.value))}
          />
        </Field>
        <Field label="PDF資料名">
          <Input
            value={property.pdfName ?? ""}
            onChange={(event) => update("pdfName", event.target.value)}
            placeholder="物件概要.pdf"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">アピールポイント（箇条書き）</h2>
        {property.highlights.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(event) => {
                const next = [...property.highlights];
                next[index] = event.target.value;
                update("highlights", next);
              }}
              placeholder="白金台駅徒歩6分"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                update(
                  "highlights",
                  property.highlights.filter((_, current) => current !== index),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => update("highlights", [...property.highlights, ""])}>
          <Plus className="h-4 w-4" />
          行を追加
        </Button>
        <Field label="運営への申し送り">
          <Textarea
            value={property.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="資料作成中のため一般公開は来週予定、など"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">写真</h2>
        <p className="text-sm text-muted">デモ用の写真セットから選択できます。</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {presetImages.map((src) => {
            const selected = property.images.includes(src);
            return (
              <button
                key={src}
                type="button"
                onClick={() =>
                  update(
                    "images",
                    selected ? property.images.filter((item) => item !== src) : [...property.images, src],
                  )
                }
                className={`overflow-hidden rounded-2xl border-2 ${
                  selected ? "border-aqua-500 ring-4 ring-aqua-100" : "border-transparent"
                }`}
              >
                <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {saved ? "下書きを保存しました。" : "送信すると運営の確認待ちになります。"}
        </p>
        <div className="flex gap-3">
          <Button type="submit" variant="secondary">
            下書き保存
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              const next = persist("submitted");
              submitProperty(next.id);
              router.push("/company/properties");
            }}
          >
            運営へ送信
          </Button>
        </div>
      </div>
    </form>
  );
}

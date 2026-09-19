"use client";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, EyeOff, Plus, Trash2 } from "lucide-react";
import { nowIso } from "@/lib/format";
import { presetImages } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Property } from "@/lib/types";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";

export function PropertyForm({
  initial,
  mode,
  onDirtyChange,
}: {
  initial: Property;
  mode: "create" | "edit";
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const navigate = useNavigate();
  const { saveProperty, submitProperty } = useStore();
  const [property, setProperty] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(snapshot(property)) !== JSON.stringify(snapshot(baseline)));
  }, [baseline, onDirtyChange, property]);

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
    setBaseline(next);
    return next;
  };

  const missingRequired = (
    [
      [property.buildingName, "マンション名"],
      [property.city, "市区町村"],
      [property.town, "町名"],
      [property.station, "最寄駅"],
      [property.price > 0, "価格"],
    ] as const
  )
    .filter(([ok]) => !ok)
    .map(([, label]) => label);
  const canSubmit = missingRequired.length === 0;

  return (
    <form
      className="space-y-8 pb-28 lg:pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        const next = persist();
        setSaved(true);
        if (mode === "create") {
          navigate(`/company/properties/${next.id}`);
        }
      }}
    >
      <div className="rounded-2xl border border-aqua-100 bg-aqua-50/70 px-4 py-3.5 sm:px-5">
        <p className="text-[13px] font-semibold text-aqua-700">送信に必要な項目</p>
        <p className="mt-1 text-sm font-medium text-ink">
          マンション名 / 市区町村 / 町名 / 最寄駅 / 価格
        </p>
        <p className="mt-1 text-[13px] text-muted">上記以外は任意</p>
      </div>

      <Card className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
        <CardHeading
          className="md:col-span-2"
          title="基本情報"
          description="物件の所在地と建物情報を入力してください。"
        />
        <div className="md:col-span-2">
          <Field label="マンション名" required>
            <Input
              value={property.buildingName}
              onChange={(event) => update("buildingName", event.target.value)}
              placeholder="パークホームズ白金台"
              required
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="物件名（管理用）">
            <Input
              value={property.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="パークホームズ白金台 3LDK"
            />
          </Field>
        </div>
        <Field label="都道府県">
          <Input value={property.prefecture} onChange={(event) => update("prefecture", event.target.value)} />
        </Field>
        <Field label="市区町村" required>
          <Input
            value={property.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder="港区"
            required
          />
        </Field>
        <Field label="町名" required>
          <Input
            value={property.town}
            onChange={(event) => update("town", event.target.value)}
            placeholder="白金台"
            required
          />
        </Field>
        <div className="grid gap-5 rounded-2xl bg-aqua-50/70 p-4 md:col-span-2 md:grid-cols-2">
          <Field label="番地" hint="運営側で配信時に目隠しできます">
            <Input
              value={property.addressDetail}
              onChange={(event) => update("addressDetail", event.target.value)}
              placeholder="4-12-8"
            />
          </Field>
          <Field label="部屋番号" hint="詳細すぎる情報は配信時に非表示を推奨">
            <Input
              value={property.roomNumber}
              onChange={(event) => update("roomNumber", event.target.value)}
              placeholder="1203"
            />
          </Field>
          <p className="flex items-start gap-1.5 text-[13px] leading-5 text-muted md:col-span-2">
            <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aqua-600" />
            入力できます。配信前に運営が必要に応じて非表示にします。
          </p>
        </div>
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

      <Card className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
        <CardHeading
          className="md:col-span-2"
          title="物件スペック"
          description="間取り・価格・交通など、物件の詳細情報を入力してください。"
        />
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
        <div className="grid grid-cols-2 gap-5">
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
        </div>
        <Field label="ペット">
          <Select
            value={property.petAllowed ? "yes" : "no"}
            onChange={(event) => update("petAllowed", event.target.value === "yes")}
          >
            <option value="no">不可</option>
            <option value="yes">可</option>
          </Select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2 md:col-span-2">
          <Field label="最寄駅" required>
            <Input
              value={property.station}
              onChange={(event) => update("station", event.target.value)}
              placeholder="白金台駅"
              required
            />
          </Field>
          <Field label="徒歩（分）">
            <Input
              type="number"
              value={property.walkMinutes}
              onChange={(event) => update("walkMinutes", Number(event.target.value))}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:col-span-2 md:grid-cols-3">
          <Field label="価格（万円）" required>
            <Input
              type="number"
              value={property.price}
              onChange={(event) => update("price", Number(event.target.value))}
              required
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
        </div>
        <Field label="PDF資料名">
          <Input
            value={property.pdfName ?? ""}
            onChange={(event) => update("pdfName", event.target.value)}
            placeholder="物件概要.pdf"
          />
        </Field>
      </Card>

      <Card className="space-y-5 p-6 sm:p-8">
        <CardHeading
          title="アピールポイント（箇条書き）"
          description="LINE配信時に伝えたい物件の特徴を入力してください。"
        />
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
              className="min-h-11 min-w-11 shrink-0"
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
        <Button
          type="button"
          variant="secondary"
          className="min-h-11"
          onClick={() => update("highlights", [...property.highlights, ""])}
        >
          <Plus className="h-4 w-4" />
          項目を追加
        </Button>
        <Field label="運営への申し送り" hint="運営担当者だけに伝えたい内容があれば入力してください。">
          <Textarea
            value={property.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="資料作成中のため一般公開は来週予定、など"
          />
        </Field>
      </Card>

      <Card className="space-y-5 p-6 sm:p-8">
        <CardHeading
          title="写真"
          description="デモ用の写真セットから、この物件に使用する画像を選択してください。"
        />
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
                className={`relative overflow-hidden rounded-[20px] border ${
                  selected ? "border-ink ring-4 ring-aqua-50" : "border-hairline"
                }`}
              >
                <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
                {selected ? (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-aqua-500 px-2 py-1 text-[11px] font-semibold text-white">
                    <Check className="h-3 w-3" />
                    選択中
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="sticky bottom-20 z-10 -mx-4 border-t border-hairline bg-[rgba(250,248,244,0.94)] px-4 py-3 backdrop-blur sm:-mx-0 sm:rounded-[24px] sm:border lg:bottom-4">
        <p className="text-[13px] text-muted">
          {canSubmit
            ? saved
              ? "下書きを保存しました。"
              : "送信後は運営の確認待ちになります"
            : `${missingRequired.join("・")}を入力すると送信できます`}
        </p>
        <div className="mt-3 flex gap-2 sm:justify-end">
          <Button type="submit" variant="secondary" className="min-h-11 flex-1 whitespace-nowrap sm:flex-none">
            下書き保存
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 whitespace-nowrap sm:min-w-40 sm:flex-none"
            disabled={!canSubmit}
            onClick={() => {
              const next = persist("submitted");
              submitProperty(next.id);
              navigate("/company/properties");
            }}
          >
            運営へ送信
          </Button>
        </div>
      </div>
    </form>
  );
}

function snapshot(property: Property) {
  return {
    ...property,
    updatedAt: "",
    createdAt: "",
    submittedAt: "",
    reviewedAt: "",
    broadcastedAt: "",
  };
}

function CardHeading({
  title,
  description,
  className = "",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-display text-lg font-medium tracking-[-0.03em] text-ink sm:text-xl">{title}</h2>
      <p className="mt-1 text-[13px] leading-6 text-muted sm:text-sm">{description}</p>
    </div>
  );
}

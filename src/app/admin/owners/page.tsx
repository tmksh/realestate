"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Field, Input, PageHeader, Select } from "@/components/ui";
import { formatDate, ownerStatusLabel, ownerStatusTone } from "@/lib/format";
import { newId, nowIso } from "@/lib/format";
import { activeOwnerCount, useStore } from "@/lib/store";
import type { OwnerAccount } from "@/lib/types";

const emptyDraft = {
  name: "",
  email: "",
  affiliation: "",
  propertyIds: [] as string[],
};

export default function OwnersPage() {
  const navigate = useNavigate();
  const { state, saveOwner, setOwnerStatus, loginOwner } = useStore();
  const [draft, setDraft] = useState(emptyDraft);

  const createOwner = () => {
    if (!draft.name || !draft.email || !draft.affiliation || draft.propertyIds.length === 0) return;
    const owner: OwnerAccount = {
      id: newId("o"),
      name: draft.name,
      email: draft.email,
      affiliation: draft.affiliation,
      status: "invited",
      propertyIds: draft.propertyIds,
      createdAt: nowIso(),
    };
    saveOwner(owner);
    setDraft(emptyDraft);
  };

  const toggleProperty = (id: string) => {
    setDraft((current) => ({
      ...current,
      propertyIds: current.propertyIds.includes(id)
        ? current.propertyIds.filter((item) => item !== id)
        : [...current.propertyIds, id],
    }));
  };

  return (
    <div className="w-full">
      <PageHeader
        kicker="運営"
        title="オーナーアカウント管理"
        description="運営からオーナー用アカウントを発行し、管理できる物件を指定します。利用中の人数はダッシュボードと一致します。"
        descriptionClassName="whitespace-nowrap"
      />

      <Card className="mt-5 space-y-4 p-5">
        <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-ink">新規発行</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="氏名" required>
            <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </Field>
          <Field label="メールアドレス" required>
            <Input
              type="email"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Field>
          <Field label="所属" required>
            <Input
              value={draft.affiliation}
              onChange={(event) => setDraft({ ...draft, affiliation: event.target.value })}
            />
          </Field>
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-muted">
            管理できる物件<span className="ml-1 text-ink">*</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {state.properties.map((property) => {
              const checked = draft.propertyIds.includes(property.id);
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => toggleProperty(property.id)}
                  className={`rounded-[18px] border px-3 py-2.5 text-left text-sm transition ${
                    checked
                      ? "border-ink bg-canvas text-ink"
                      : "border-hairline bg-white text-ink hover:bg-canvas"
                  }`}
                >
                  <p className="font-semibold">{property.buildingName}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{property.companyName}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[12px] leading-5 text-muted">本人には、ここで選んだ物件だけが見えます。</p>
        </div>
        <Button
          onClick={createOwner}
          disabled={!draft.name || !draft.email || !draft.affiliation || draft.propertyIds.length === 0}
        >
          アカウントを発行
        </Button>
      </Card>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-ink">利用者一覧</h2>
          <p className="text-[13px] text-muted">
            利用中{" "}
            <span className="font-display font-semibold text-ink">{activeOwnerCount(state.owners)}</span>
            名
          </p>
        </div>
        <div className="hidden grid-cols-[1.1fr_1.2fr_1fr_0.6fr_0.9fr] items-center border-b border-hairline bg-canvas px-5 py-3 text-[12px] font-medium text-muted md:grid">
          <span>氏名</span>
          <span>メールアドレス</span>
          <span>所属</span>
          <span>利用状態</span>
          <span>操作</span>
        </div>
        {state.owners.map((owner) => (
          <div
            key={owner.id}
            className="border-b border-hairline px-5 py-4 last:border-b-0 md:grid md:grid-cols-[1.1fr_1.2fr_1fr_0.6fr_0.9fr] md:items-center"
          >
            <div>
              <p className="font-semibold text-ink">{owner.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {owner.propertyIds
                  .map((id) => state.properties.find((item) => item.id === id)?.buildingName)
                  .filter(Boolean)
                  .join("、") || "物件未設定"}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted md:mt-0">{owner.email}</p>
            <p className="mt-1 text-sm text-muted md:mt-0">{owner.affiliation}</p>
            <div className="mt-2 md:mt-0">
              <Badge tone={ownerStatusTone(owner.status)}>{ownerStatusLabel(owner.status)}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
              {owner.status === "active" ? (
                <Button variant="secondary" className="min-h-9 px-3 text-[12px]" onClick={() => setOwnerStatus(owner.id, "suspended")}>
                  利用停止
                </Button>
              ) : (
                <Button variant="secondary" className="min-h-9 px-3 text-[12px]" onClick={() => setOwnerStatus(owner.id, "active")}>
                  利用開始
                </Button>
              )}
              {owner.status === "active" ? (
                <Button
                  className="min-h-9 px-3 text-[12px]"
                  onClick={() => {
                    loginOwner(owner.id);
                    navigate("/company");
                  }}
                >
                  表示を確認
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

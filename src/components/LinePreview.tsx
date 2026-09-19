import type { ReactNode } from "react";
import { ChevronLeft, FileText, Home, Menu } from "lucide-react";
import {
  buildLineMessage,
  formatLabel,
  visibleAddress,
  visibleBuilding,
  visiblePrice,
} from "@/lib/format";
import type { Property } from "@/lib/types";

export function LinePreview({ property }: { property: Property }) {
  const format = property.broadcastFormat;
  const body =
    format === "card"
      ? [
          visibleAddress(property),
          `${property.layout} / ${property.area}㎡ / ${property.floor}階`,
          `${property.station} 徒歩${property.walkMinutes}分`,
          visiblePrice(property),
          property.customMessage || "気になる方は下のボタンからお知らせください。",
        ].join("\n")
      : buildLineMessage(property);

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
          配信イメージ
        </span>
        <span className="text-[11px] text-muted">{formatLabel(format)}</span>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#d5dbe2] bg-white shadow-[0_12px_28px_rgba(22,20,18,0.08)]">
        <div className="flex items-center gap-2 border-b border-[#eceff2] px-2 py-2">
          <ChevronLeft className="h-5 w-5 shrink-0 text-[#111]" strokeWidth={2.2} />
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06c755] text-[10px] font-bold text-white">
            AQ
          </div>
          <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#111]">AQUALINE</p>
          <Home className="h-4 w-4 shrink-0 text-[#111]" strokeWidth={1.8} />
          <Menu className="h-4 w-4 shrink-0 text-[#111]" strokeWidth={1.8} />
        </div>

        <div className="line-chat-bg px-2.5 py-3">
          <div className="mb-3 text-center">
            <span className="rounded-full bg-black/18 px-2 py-0.5 text-[10px] text-white/90">本日</span>
          </div>

          {format === "card" ? (
            <Incoming>
              <FlexCard property={property} body={body} />
            </Incoming>
          ) : format === "pdf" ? (
            <>
              <Incoming>
                <FileBubble name={property.pdfName ?? `${visibleBuilding(property)}.pdf`} />
              </Incoming>
              <Incoming>
                <TextBubble text={body} />
                <ActionButtons />
              </Incoming>
            </>
          ) : (
            <>
              {property.images[0] ? (
                <Incoming>
                  <ImageBubble src={property.images[0]} alt={visibleBuilding(property)} />
                </Incoming>
              ) : null}
              <Incoming>
                <TextBubble text={body} />
                <ActionButtons />
              </Incoming>
            </>
          )}
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-muted">
        実際のトーク画面ではなく、送る内容から作った見本です。最終確認はテスト送信したスマホで行ってください。機種によって文字や余白が少し異なる場合があります。
      </p>
    </div>
  );
}

function Incoming({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end gap-1.5">
      <div className="mb-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#06c755] text-[8px] font-bold text-white">
        AQ
      </div>
      <div className="min-w-0 max-w-[78%]">
        <p className="mb-0.5 pl-1 text-[10px] text-[#3d4a52]">AQUALINE</p>
        {children}
      </div>
      <p className="mb-1 shrink-0 text-[10px] leading-none text-[#3d4a52]">18:24</p>
    </div>
  );
}

function TextBubble({ text }: { text: string }) {
  return (
    <div className="line-bubble line-bubble-in px-3 py-2">
      <PreviewMessage text={text} />
    </div>
  );
}

function ImageBubble({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="property-photo block h-[168px] w-full rounded-[14px] object-cover"
    />
  );
}

function FileBubble({ name }: { name: string }) {
  return (
    <div className="line-bubble line-bubble-in flex items-center gap-2.5 px-3 py-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eef6ee] text-[#06c755]">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#111]">{name}</p>
        <p className="text-[11px] text-[#8e8e93]">PDFファイル</p>
      </div>
    </div>
  );
}

function FlexCard({ property, body }: { property: Property; body: string }) {
  return (
    <div className="line-bubble overflow-hidden rounded-[16px]">
      {property.images[0] ? (
        <img
          src={property.images[0]}
          alt={visibleBuilding(property)}
          className="property-photo block h-[168px] w-full object-cover"
        />
      ) : null}
      <div className="space-y-2 px-3 py-2.5">
        <p className="text-[15px] font-bold leading-snug text-[#111]">{visibleBuilding(property)}</p>
        <PreviewMessage text={body} />
      </div>
      <ActionButtons />
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="mt-1 overflow-hidden rounded-[12px] bg-white">
      <button type="button" className="block w-full border-t border-[#eee] py-2.5 text-center text-[14px] font-medium text-[#06c755]">
        いいね
      </button>
      <button type="button" className="block w-full border-t border-[#eee] py-2.5 text-center text-[14px] font-medium text-[#06c755]">
        🏠 気になる
      </button>
    </div>
  );
}

function PreviewMessage({ text }: { text: string }) {
  return (
    <div className="text-[14px] leading-[1.55] text-[#222]">
      {text.split("\n").map((line, index) => {
        if (line === "") {
          return <div key={`gap-${index}`} className="h-1.5" />;
        }
        if (line === "【未公開マンション情報】" || line === "▼ポイント") {
          return (
            <p key={index} className="font-semibold text-[#111]">
              {line}
            </p>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

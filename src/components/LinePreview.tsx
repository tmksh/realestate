import { FileText } from "lucide-react";
import {
  buildLineMessage,
  formatLabel,
  visibleAddress,
  visibleBuilding,
  visiblePrice,
} from "@/lib/format";
import type { Property } from "@/lib/types";

export function LinePreview({
  property,
  compact = false,
}: {
  property: Property;
  compact?: boolean;
}) {
  const body =
    property.broadcastFormat === "card"
      ? [
          visibleAddress(property),
          `${property.layout} / ${property.area}㎡ / ${property.floor}階`,
          `${property.station} 徒歩${property.walkMinutes}分`,
          visiblePrice(property),
          "",
          property.customMessage || "気になる方は👍か🏠を送ってください。",
        ].join("\n")
      : buildLineMessage(property);

  return (
    <div
      className={`mx-auto w-full overflow-hidden bg-[#24343c] ${
        compact ? "max-w-[280px] rounded-[12px] p-[6px]" : "max-w-[368px] rounded-[12px] p-[7px]"
      }`}
    >
      <div className={`px-4 pb-2 ${compact ? "pt-3" : "pt-3.5"} text-white`}>
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/20" />
        <p className="text-center text-[11px] text-white/55">公式アカウント</p>
        <p className="text-center text-sm font-semibold">AQUALINE 未公開物件</p>
      </div>
      <div className={`rounded-[10px] bg-[#7d96a8] px-3 ${compact ? "min-h-[360px] py-3" : "min-h-[420px] py-4"}`}>
        <div className="line-bubble overflow-hidden rounded-[10px] rounded-tl-sm shadow-none">
          {property.broadcastFormat === "card" && property.images[0] ? (
            <div
              className="h-36 bg-cover bg-center"
              style={{ backgroundImage: `url(${property.images[0]})` }}
            />
          ) : null}
          <div className="space-y-3 p-4">
            {property.broadcastFormat === "pdf" ? (
              <div className="flex items-center gap-3 rounded-[8px] bg-aqua-50 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-aqua-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {property.pdfName ?? `${visibleBuilding(property)}.pdf`}
                  </p>
                  <p className="text-xs text-muted">PDF資料</p>
                </div>
              </div>
            ) : null}
            <p className="text-[12px] font-semibold text-aqua-600">
              {formatLabel(property.broadcastFormat)}配信
            </p>
            <p className="text-[15px] font-bold leading-snug text-ink">{visibleBuilding(property)}</p>
            <PreviewMessage text={body} />
          </div>
        </div>
        <div className="mt-4 border-t border-white/20 pt-4">
          <div className="flex justify-end gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-lg shadow-sm">👍</span>
            <span className="rounded-full bg-white px-3 py-1 text-lg shadow-sm">🏠</span>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/55">会員はこのスタンプで反応します</p>
        </div>
      </div>
    </div>
  );
}

function PreviewMessage({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="text-[14px] leading-[1.7] text-slate-700">
      {lines.map((line, index) => {
        if (line === "") {
          return <div key={`gap-${index}`} className="h-2" />;
        }
        if (line === "【未公開マンション情報】") {
          return (
            <p key={index} className="font-semibold text-ink">
              {line}
            </p>
          );
        }
        if (line === "▼ポイント") {
          return (
            <p key={index} className="mt-3 font-medium text-ink">
              {line}
            </p>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

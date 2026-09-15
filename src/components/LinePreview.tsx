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
  return (
    <div className={`phone-frame mx-auto overflow-hidden rounded-[2rem] ${compact ? "w-[280px]" : "w-[320px]"}`}>
      <div className="px-5 pb-3 pt-4 text-white">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
        <p className="text-center text-[11px] text-white/60">公式アカウント</p>
        <p className="text-center text-sm font-semibold">AQUALINE 未公開物件</p>
      </div>
      <div className="min-h-[420px] bg-[#7494a8] px-3 py-4">
        <div className="line-bubble overflow-hidden rounded-2xl rounded-tl-sm">
          {property.broadcastFormat === "card" && property.images[0] ? (
            <div
              className="h-36 bg-cover bg-center"
              style={{ backgroundImage: `url(${property.images[0]})` }}
            />
          ) : null}
          <div className="space-y-3 p-4">
            {property.broadcastFormat === "pdf" ? (
              <div className="flex items-center gap-3 rounded-xl bg-aqua-50 px-3 py-3">
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
            <p className="text-[11px] font-semibold text-aqua-600">
              {formatLabel(property.broadcastFormat)}配信
            </p>
            <p className="text-sm font-bold text-ink">{visibleBuilding(property)}</p>
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-slate-700">
              {property.broadcastFormat === "card"
                ? [
                    visibleAddress(property),
                    `${property.layout} / ${property.area}㎡ / ${property.floor}階`,
                    `${property.station} 徒歩${property.walkMinutes}分`,
                    visiblePrice(property),
                    "",
                    property.customMessage || "気になる方は👍か🏠を送ってください。",
                  ].join("\n")
                : buildLineMessage(property)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-lg shadow-sm">👍</span>
          <span className="rounded-full bg-white px-3 py-1 text-lg shadow-sm">🏠</span>
        </div>
      </div>
      <div className="bg-[#1c2b33] px-4 py-3 text-center text-[11px] text-white/50">
        会員はこのスタンプで反応します
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { formatPrice, isMasked, statusLabel, visibleAddress } from "@/lib/format";
import type { Property, PropertyStatus } from "@/lib/types";
import { Card } from "./ui";

const statusClass: Record<PropertyStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-800",
  rejected: "bg-rose-50 text-rose-700",
  ready: "bg-aqua-50 text-aqua-800",
  broadcasted: "bg-aqua-100 text-aqua-800",
};

export function PropertyCard({
  property,
  href,
  extra,
}: {
  property: Property;
  href: string;
  extra?: React.ReactNode;
}) {
  const detailHidden = isMasked(property, "addressDetail");
  const addressBase = `${property.prefecture}${property.city}${property.town}`;
  const addressText = detailHidden ? addressBase : visibleAddress(property);

  return (
    <Link
      to={href}
      className="group block h-full rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden rounded-[10px] border border-slate-200 shadow-none transition duration-150 group-hover:border-slate-300 group-hover:shadow-[0_1px_8px_rgba(16,35,45,0.06)] group-active:border-slate-300">
        <div className="relative h-[132px] overflow-hidden bg-slate-100 md:h-[148px]">
          {property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
              <ImageOff className="h-5 w-5" />
              <p className="text-[13px] font-medium">画像未設定</p>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex h-6 items-center rounded-md px-2 text-[12px] font-semibold leading-none ${statusClass[property.status]}`}
            >
              {statusLabel(property.status)}
            </span>
          </div>
        </div>
        <div className="px-5 pb-4 pt-3.5">
          <p className="line-clamp-2 min-h-[2.5rem] text-[18px] font-bold leading-snug text-ink">
            {property.buildingName || "名称未設定"}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] leading-[1.5] text-muted">
            <span>{addressText}</span>
            {detailHidden ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                詳細非公開
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-[13px] leading-[1.5] text-slate-500">
            {[
              property.layout,
              `${property.area}㎡`,
              `${property.floor}階`,
              `${property.station || "駅未設定"} 徒歩${property.walkMinutes}分`,
            ].join(" ｜ ")}
          </p>
          <p className="mt-3 font-display text-[18px] font-bold leading-none text-ink">
            {formatPrice(property.price)}
          </p>
          {extra ? <div className="mt-2.5">{extra}</div> : null}
        </div>
      </Card>
    </Link>
  );
}

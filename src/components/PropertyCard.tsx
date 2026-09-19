import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { formatPrice, isMasked, statusLabel, visibleAddress } from "@/lib/format";
import type { Property, PropertyStatus } from "@/lib/types";
import { Card } from "./ui";

const statusClass: Record<PropertyStatus, string> = {
  draft: "bg-white/92 text-slate-700",
  submitted: "bg-amber-50/95 text-amber-800",
  rejected: "bg-rose-50/95 text-rose-700",
  ready: "bg-aqua-50/95 text-aqua-800",
  broadcasted: "bg-aqua-100/95 text-aqua-800",
};

export function PropertyPhoto({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="property-photo absolute inset-0 h-full w-full" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
          <ImageOff className="h-5 w-5" />
          <p className="text-[13px] font-medium">画像未設定</p>
        </div>
      )}
    </div>
  );
}

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
      className="group block h-full rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400/70 focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition duration-200 group-hover:shadow-[0_1px_0_rgba(22,20,18,0.04),0_16px_32px_rgba(22,20,18,0.06)]">
        <div className="relative h-[268px] md:h-[300px]">
          <PropertyPhoto src={property.images[0]} alt={property.name} className="absolute inset-0 h-full" />
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold leading-none shadow-sm ${statusClass[property.status]}`}
            >
              {statusLabel(property.status)}
            </span>
          </div>
        </div>
        <div className="px-5 pb-4 pt-3.5">
          <p className="line-clamp-2 min-h-[2.5rem] font-display text-[17px] font-medium leading-snug tracking-[-0.02em] text-ink">
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
          <p className="mt-3 font-display text-[18px] font-medium leading-none tracking-[-0.03em] text-ink">
            {formatPrice(property.price)}
          </p>
          {extra ? <div className="mt-2.5">{extra}</div> : null}
        </div>
      </Card>
    </Link>
  );
}

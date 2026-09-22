import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatPrice, isMasked, statusLabel, visibleAddress } from "@/lib/format";
import type { Property, PropertyStatus } from "@/lib/types";
import { Card } from "./ui";

const statusClass: Record<PropertyStatus, string> = {
  draft: "bg-white/92 text-muted",
  submitted: "bg-amber-50/95 text-amber-800",
  rejected: "bg-rose-50/95 text-rose-700",
  ready: "bg-ink/90 text-white",
  broadcasted: "bg-line-wash/95 text-[#047857]",
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
    <div className={`relative overflow-hidden bg-canvas ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="property-photo absolute inset-0 h-full w-full" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-canvas text-faint">
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
      href={href}
      className="group block h-full rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition duration-200 group-hover:shadow-[var(--shadow-lift)]">
        <div className="relative h-[268px] md:h-[300px]">
          <PropertyPhoto src={property.images[0]} alt={property.name} className="absolute inset-0 h-full" />
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium leading-none ${statusClass[property.status]}`}
            >
              {statusLabel(property.status)}
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 pt-4">
          <p className="line-clamp-2 min-h-[2.5rem] font-display text-[17px] font-semibold leading-snug tracking-[-0.03em] text-ink">
            {property.buildingName || "名称未設定"}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] leading-[1.5] text-muted">
            <span>{addressText}</span>
            {detailHidden ? (
              <span className="rounded-full bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-muted">
                詳細非公開
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-[13px] leading-[1.5] text-faint">
            {[
              property.layout,
              `${property.area}㎡`,
              `${property.floor}階`,
              `${property.station || "駅未設定"} 徒歩${property.walkMinutes}分`,
            ].join(" ｜ ")}
          </p>
          <p className="mt-3 font-display text-[20px] font-semibold leading-none tracking-[-0.04em] text-ink">
            {formatPrice(property.price)}
          </p>
          {extra ? <div className="mt-3">{extra}</div> : null}
        </div>
      </Card>
    </Link>
  );
}

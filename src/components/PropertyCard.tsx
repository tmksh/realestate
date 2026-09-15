import Image from "next/image";
import Link from "next/link";
import { MapPin, Train } from "lucide-react";
import { formatPrice, statusLabel, statusTone, visibleAddress } from "@/lib/format";
import type { Property } from "@/lib/types";
import { Badge, Card } from "./ui";

export function PropertyCard({
  property,
  href,
  extra,
}: {
  property: Property;
  href: string;
  extra?: React.ReactNode;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_40px_rgba(16,35,45,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-aqua-100">
          {property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-aqua-700">
              画像未設定
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {property.buildingName || "名称未設定"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {visibleAddress(property)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.layout}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.area}㎡</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.floor}階</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <Train className="h-3 w-3" />
              {property.station || "駅未設定"} 徒歩{property.walkMinutes}分
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-xl font-semibold text-aqua-700">
              {formatPrice(property.price)}
            </p>
            {extra}
          </div>
        </div>
      </Card>
    </Link>
  );
}

import type {
  BroadcastFormat,
  MaskableField,
  OwnerStatus,
  Property,
  PropertyStatus,
  ReactionType,
} from "./types";

export function formatPrice(manYen: number) {
  if (manYen >= 10000) {
    const oku = Math.floor(manYen / 10000);
    const rest = manYen % 10000;
    return rest === 0 ? `${oku}億円` : `${oku}億${rest.toLocaleString()}万円`;
  }
  return `${manYen.toLocaleString()}万円`;
}

export function formatYen(yen: number) {
  return `${yen.toLocaleString()}円`;
}

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

export function statusLabel(status: PropertyStatus) {
  switch (status) {
    case "draft":
      return "下書き";
    case "submitted":
      return "確認待ち";
    case "rejected":
      return "差戻し";
    case "ready":
      return "配信準備";
    case "broadcasted":
      return "配信済み";
  }
}

export function statusTone(status: PropertyStatus) {
  switch (status) {
    case "draft":
      return "neutral";
    case "submitted":
      return "warn";
    case "rejected":
      return "danger";
    case "ready":
      return "info";
    case "broadcasted":
      return "info";
  }
}

export function formatLabel(format: BroadcastFormat) {
  switch (format) {
    case "bullets":
      return "箇条書き";
    case "card":
      return "カード";
    case "pdf":
      return "PDF添付";
  }
}

export function isMasked(property: Property, field: MaskableField) {
  return property.maskedFields.includes(field);
}

export function visibleAddress(property: Property) {
  const base = `${property.prefecture}${property.city}${property.town}`;
  if (isMasked(property, "addressDetail")) {
    return `${base}（詳細非公開）`;
  }
  return `${base}${property.addressDetail}`;
}

export function visibleBuilding(property: Property) {
  return isMasked(property, "buildingName") ? "非公開マンション" : property.buildingName;
}

export function visibleRoom(property: Property) {
  return isMasked(property, "roomNumber") ? "***号室" : `${property.roomNumber}号室`;
}

export function visiblePrice(property: Property) {
  return isMasked(property, "price") ? "価格非公開（応相談）" : formatPrice(property.price);
}

export function buildLineMessage(property: Property) {
  const lines = [
    "【未公開マンション情報】",
    "",
    visibleBuilding(property),
    `所在地：${visibleAddress(property)}`,
    `間取り：${property.layout} ／ ${property.area}㎡`,
    `所在階：${property.floor}階 / ${property.totalFloors}階建`,
    `築年：${property.builtYear}年${property.builtMonth}月`,
    `最寄：${property.station} 徒歩${property.walkMinutes}分`,
    `価格：${visiblePrice(property)}`,
  ];

  if (!isMasked(property, "roomNumber")) {
    lines.splice(4, 0, `部屋：${visibleRoom(property)}`);
  }

  if (property.highlights.length > 0) {
    lines.push("", "▼ポイント");
    property.highlights.forEach((item) => lines.push(`・${item}`));
  }

  if (property.customMessage) {
    lines.push("", property.customMessage);
  } else {
    lines.push("", "気になる方は「いいね」または🏠スタンプを送ってください。");
  }

  lines.push("", "※SUUMO等への一般公開前の限定情報です。");
  return lines.join("\n");
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function reactionLabel(type: ReactionType) {
  switch (type) {
    case "like":
      return "いいね";
    case "stamp":
      return "スタンプ";
    case "text":
      return "テキスト";
  }
}

export function ownerStatusLabel(status: OwnerStatus) {
  switch (status) {
    case "active":
      return "利用中";
    case "invited":
      return "招待中";
    case "suspended":
      return "停止中";
  }
}

export function ownerStatusTone(status: OwnerStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "invited":
      return "warn" as const;
    case "suspended":
      return "neutral" as const;
  }
}

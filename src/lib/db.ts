import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppState,
  Broadcast,
  BroadcastFormat,
  Company,
  MaskableField,
  Member,
  OwnerAccount,
  OwnerStatus,
  Property,
  PropertyStatus,
  Reaction,
  ReactionType,
  User,
} from "./types";

type QueryError = { message: string; code?: string } | null;

function num(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function rows<T>(
  query: PromiseLike<{ data: T[] | null; error: QueryError }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    if (error.code === "42501") return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export function propertyToRow(property: Property) {
  return {
    id: property.id,
    company_id: property.companyId,
    company_name: property.companyName,
    status: property.status,
    name: property.name,
    building_name: property.buildingName,
    prefecture: property.prefecture,
    city: property.city,
    town: property.town,
    address_detail: property.addressDetail,
    room_number: property.roomNumber,
    floor: property.floor,
    total_floors: property.totalFloors,
    layout: property.layout,
    area: property.area,
    balcony_area: property.balconyArea ?? null,
    built_year: property.builtYear,
    built_month: property.builtMonth,
    direction: property.direction,
    station: property.station,
    walk_minutes: property.walkMinutes,
    price: property.price,
    management_fee: property.managementFee,
    reserve_fund: property.reserveFund,
    highlights: property.highlights,
    notes: property.notes,
    images: property.images,
    pdf_name: property.pdfName ?? null,
    pet_allowed: property.petAllowed,
    masked_fields: property.maskedFields,
    broadcast_format: property.broadcastFormat,
    custom_message: property.customMessage,
    reject_reason: property.rejectReason ?? null,
    created_at: property.createdAt,
    updated_at: property.updatedAt,
    submitted_at: property.submittedAt ?? null,
    reviewed_at: property.reviewedAt ?? null,
    broadcasted_at: property.broadcastedAt ?? null,
  };
}

export function propertyFromRow(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    companyName: String(row.company_name ?? ""),
    status: row.status as PropertyStatus,
    name: String(row.name ?? ""),
    buildingName: String(row.building_name ?? ""),
    prefecture: String(row.prefecture ?? ""),
    city: String(row.city ?? ""),
    town: String(row.town ?? ""),
    addressDetail: String(row.address_detail ?? ""),
    roomNumber: String(row.room_number ?? ""),
    floor: num(row.floor, 1),
    totalFloors: num(row.total_floors, 1),
    layout: String(row.layout ?? ""),
    area: num(row.area),
    balconyArea: row.balcony_area == null ? undefined : num(row.balcony_area),
    builtYear: num(row.built_year, 2000),
    builtMonth: num(row.built_month, 1),
    direction: String(row.direction ?? ""),
    station: String(row.station ?? ""),
    walkMinutes: num(row.walk_minutes),
    price: num(row.price),
    managementFee: num(row.management_fee),
    reserveFund: num(row.reserve_fund),
    highlights: (row.highlights as string[]) ?? [],
    notes: String(row.notes ?? ""),
    images: (row.images as string[]) ?? [],
    pdfName: row.pdf_name ? String(row.pdf_name) : undefined,
    petAllowed: Boolean(row.pet_allowed),
    maskedFields: ((row.masked_fields as MaskableField[]) ?? []),
    broadcastFormat: (row.broadcast_format as BroadcastFormat) ?? "bullets",
    customMessage: String(row.custom_message ?? ""),
    rejectReason: row.reject_reason ? String(row.reject_reason) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : undefined,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    broadcastedAt: row.broadcasted_at ? String(row.broadcasted_at) : undefined,
  };
}

export async function loadWorkspace(supabase: SupabaseClient): Promise<AppState> {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser) {
    return emptyWorkspace();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, title, company_id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  let currentUser: User | null = null;
  if (profile?.role === "admin") {
    currentUser = {
      id: profile.id,
      name: profile.name,
      role: "admin",
      title: profile.title || "運営",
    };
  } else if (profile?.role === "company" && profile.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", profile.company_id)
      .maybeSingle();
    currentUser = {
      id: profile.id,
      name: profile.name,
      role: "company",
      title: profile.title || "担当者",
      companyId: profile.company_id,
      companyName: company?.name,
    };
  } else {
    const { data: owner } = await supabase
      .from("owners")
      .select("id, name, affiliation, status")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();
    if (owner?.status === "active") {
      const links = await rows<{ property_id: string }>(
        supabase.from("owner_properties").select("property_id").eq("owner_id", owner.id),
      );
      currentUser = {
        id: `owner_${owner.id}`,
        name: owner.name,
        role: "owner",
        title: "オーナー管理者",
        companyName: owner.affiliation,
        ownerAccountId: owner.id,
        assignedPropertyIds: links.map((item) => item.property_id),
      };
    }
  }

  const [companyRows, propertyRows, broadcastRows, reactionRows, memberRows, ownerRows, ownerLinks] =
    await Promise.all([
      rows<Company>(supabase.from("companies").select("id, name").order("name")),
      rows<Record<string, unknown>>(supabase.from("properties").select("*").order("updated_at", { ascending: false })),
      rows<Record<string, unknown>>(supabase.from("broadcasts").select("*").order("sent_at", { ascending: false })),
      rows<Record<string, unknown>>(supabase.from("reactions").select("*").order("created_at", { ascending: false })),
      rows<Record<string, unknown>>(supabase.from("line_members").select("*").order("registered_at", { ascending: false })),
      rows<Record<string, unknown>>(supabase.from("owners").select("*").order("created_at", { ascending: false })),
      rows<{ owner_id: string; property_id: string }>(
        supabase.from("owner_properties").select("owner_id, property_id"),
      ),
    ]);

  const assigned = new Map<string, string[]>();
  for (const link of ownerLinks) {
    const list = assigned.get(link.owner_id) ?? [];
    list.push(link.property_id);
    assigned.set(link.owner_id, list);
  }

  return {
    currentUser,
    companies: companyRows,
    properties: propertyRows.map(propertyFromRow),
    broadcasts: broadcastRows.map(
      (row): Broadcast => ({
        id: String(row.id),
        propertyId: String(row.property_id),
        sentAt: String(row.sent_at),
        format: row.format as BroadcastFormat,
        recipientCount: num(row.recipient_count),
        messageText: String(row.message_text ?? ""),
      }),
    ),
    reactions: reactionRows.map(
      (row): Reaction => ({
        id: String(row.id),
        broadcastId: String(row.broadcast_id),
        propertyId: String(row.property_id),
        memberId: String(row.member_id),
        type: row.type as ReactionType,
        stamp: row.stamp ? String(row.stamp) : undefined,
        message: row.message ? String(row.message) : undefined,
        createdAt: String(row.created_at),
      }),
    ),
    members: memberRows.map(
      (row): Member => ({
        id: String(row.id),
        displayName: String(row.display_name ?? ""),
        lineId: String(row.line_id ?? ""),
        initial: String(row.initial ?? ""),
        hue: num(row.hue, 180),
        registeredAt: String(row.registered_at),
        source: String(row.source ?? ""),
      }),
    ),
    owners: ownerRows.map(
      (row): OwnerAccount => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        email: String(row.email ?? ""),
        affiliation: String(row.affiliation ?? ""),
        status: row.status as OwnerStatus,
        propertyIds: assigned.get(String(row.id)) ?? [],
        createdAt: String(row.created_at),
      }),
    ),
  };
}

export function emptyWorkspace(): AppState {
  return {
    currentUser: null,
    companies: [],
    properties: [],
    broadcasts: [],
    reactions: [],
    members: [],
    owners: [],
  };
}

export async function assertOk(error: QueryError) {
  if (error) throw new Error(error.message);
}

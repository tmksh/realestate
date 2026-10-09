"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { createClient as createBrowserSupabase } from "@/utils/supabase/client";
import { emptyWorkspace, loadWorkspace, propertyToRow } from "./db";
import { nowIso } from "./format";
import type {
  AppState,
  BroadcastFormat,
  MaskableField,
  OwnerAccount,
  OwnerStatus,
  Property,
  ReactionType,
  User,
} from "./types";

type Action =
  | { type: "hydrate"; payload: AppState }
  | { type: "setCurrentUser"; user: User }
  | { type: "addCompany"; company: { id: string; name: string } }
  | { type: "logout" }
  | { type: "reset" }
  | { type: "upsertProperty"; property: Property }
  | { type: "submitProperty"; id: string }
  | { type: "rejectProperty"; id: string; reason: string }
  | {
      type: "updateReview";
      id: string;
      maskedFields: MaskableField[];
      broadcastFormat: BroadcastFormat;
      customMessage: string;
    }
  | {
      type: "sendBroadcast";
      id: string;
      broadcastId: string;
      sentAt: string;
      recipientCount: number;
      messageText: string;
    }
  | {
      type: "addReaction";
      propertyId: string;
      broadcastId: string;
      memberId?: string;
      reactionType: ReactionType;
      stamp?: string;
      message?: string;
    }
  | { type: "upsertOwner"; owner: OwnerAccount }
  | { type: "setOwnerStatus"; id: string; status: OwnerStatus }
  | { type: "loginOwner"; ownerId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "setCurrentUser":
      return { ...state, currentUser: action.user };
    case "addCompany":
      return { ...state, companies: [...state.companies, action.company] };
    case "loginOwner": {
      const owner = state.owners.find((item) => item.id === action.ownerId);
      return {
        ...state,
        currentUser: owner ? ownerToUser(owner) : null,
      };
    }
    case "logout":
      return { ...state, currentUser: null };
    case "reset":
      return { ...emptyWorkspace(), currentUser: state.currentUser };
    case "upsertProperty":
      return {
        ...state,
        properties: state.properties.some((item) => item.id === action.property.id)
          ? state.properties.map((item) =>
              item.id === action.property.id ? action.property : item,
            )
          : [action.property, ...state.properties],
      };
    case "submitProperty":
      return {
        ...state,
        properties: state.properties.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: "submitted",
                submittedAt: nowIso(),
                updatedAt: nowIso(),
                rejectReason: undefined,
              }
            : item,
        ),
      };
    case "rejectProperty":
      return {
        ...state,
        properties: state.properties.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: "rejected",
                rejectReason: action.reason,
                updatedAt: nowIso(),
              }
            : item,
        ),
      };
    case "updateReview":
      return {
        ...state,
        properties: state.properties.map((item) =>
          item.id === action.id
            ? {
                ...item,
                maskedFields: action.maskedFields,
                broadcastFormat: action.broadcastFormat,
                customMessage: action.customMessage,
                status: item.status === "submitted" ? "ready" : item.status,
                reviewedAt: nowIso(),
                updatedAt: nowIso(),
              }
            : item,
        ),
      };
    case "sendBroadcast": {
      const property = state.properties.find((item) => item.id === action.id);
      if (!property) return state;
      const broadcast = {
        id: action.broadcastId,
        propertyId: property.id,
        sentAt: action.sentAt,
        format: property.broadcastFormat,
        recipientCount: action.recipientCount,
        messageText: action.messageText,
      };
      return {
        ...state,
        properties: state.properties.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: "broadcasted" as const,
                broadcastedAt: action.sentAt,
                updatedAt: action.sentAt,
              }
            : item,
        ),
        broadcasts: [broadcast, ...state.broadcasts],
      };
    }
    case "addReaction": {
      const memberId =
        action.memberId ??
        state.members.find(
          (member) =>
            !state.reactions.some(
              (reaction) =>
                reaction.broadcastId === action.broadcastId &&
                reaction.memberId === member.id,
            ),
        )?.id ??
        state.members[0]?.id;
      if (!memberId) return state;
      const exists = state.reactions.some(
        (item) => item.broadcastId === action.broadcastId && item.memberId === memberId,
      );
      if (exists) return state;
      return {
        ...state,
        reactions: [
          {
            id: crypto.randomUUID(),
            broadcastId: action.broadcastId,
            propertyId: action.propertyId,
            memberId,
            type: action.reactionType,
            stamp: action.stamp,
            message: action.message,
            createdAt: nowIso(),
          },
          ...state.reactions,
        ],
      };
    }
    case "upsertOwner":
      return {
        ...state,
        owners: state.owners.some((item) => item.id === action.owner.id)
          ? state.owners.map((item) => (item.id === action.owner.id ? action.owner : item))
          : [action.owner, ...state.owners],
      };
    case "setOwnerStatus":
      return {
        ...state,
        owners: state.owners.map((item) =>
          item.id === action.id ? { ...item, status: action.status } : item,
        ),
        currentUser:
          state.currentUser?.ownerAccountId === action.id && action.status !== "active"
            ? null
            : state.currentUser,
      };
    default:
      return state;
  }
}

export function ownerToUser(owner: OwnerAccount): User {
  return {
    id: `owner_${owner.id}`,
    name: owner.name,
    role: "owner",
    companyName: owner.affiliation,
    title: "オーナー管理者",
    assignedPropertyIds: owner.propertyIds,
    ownerAccountId: owner.id,
  };
}

export function visibleProperties(state: AppState): Property[] {
  const user = state.currentUser;
  if (!user) return [];
  if (user.role === "admin") return state.properties;
  if (user.role === "owner") {
    const ids = new Set(user.assignedPropertyIds ?? []);
    return state.properties.filter((item) => ids.has(item.id));
  }
  return state.properties.filter((item) => item.companyId === user.companyId);
}

export function activeOwnerCount(owners: OwnerAccount[]) {
  return owners.filter((item) => item.status === "active").length;
}

type StoreContextValue = {
  ready: boolean;
  syncError: string | null;
  state: AppState;
  adoptUser: (user: User) => void;
  logout: () => void;
  createCompany: (name: string) => Promise<{ id: string; name: string }>;
  saveProperty: (property: Property) => Promise<void>;
  submitProperty: (id: string) => Promise<void>;
  rejectProperty: (id: string, reason: string) => Promise<void>;
  updateReview: (
    id: string,
    payload: {
      maskedFields: MaskableField[];
      broadcastFormat: BroadcastFormat;
      customMessage: string;
    },
  ) => Promise<void>;
  sendBroadcast: (id: string) => Promise<string>;
  saveOwner: (owner: OwnerAccount) => Promise<void>;
  setOwnerStatus: (id: string, status: OwnerStatus) => Promise<void>;
  loginOwner: (ownerId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyWorkspace());
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    localStorage.removeItem("aqualine-store-v2");
    loadWorkspace(createBrowserSupabase())
      .then((payload) => {
        if (!cancelled) dispatch({ type: "hydrate", payload });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "データの読み込みに失敗しました");
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !state.currentUser) return;
    let cancelled = false;
    const refresh = () => {
      loadWorkspace(createBrowserSupabase())
        .then((payload) => {
          if (!cancelled && payload.currentUser) dispatch({ type: "hydrate", payload });
        })
        .catch(() => {});
    };
    const timer = window.setInterval(refresh, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, state.currentUser?.id]);

  useEffect(() => {
    if (!ready || state.currentUser?.role !== "admin") return;
    void fetch("/api/line/prepare", { method: "POST" });
  }, [ready, state.currentUser?.role]);

  const value = useMemo<StoreContextValue>(() => {
    const check = (error: { message: string } | null) => {
      if (!error) return;
      setSyncError(error.message);
      throw new Error(error.message);
    };

    return {
      ready,
      syncError,
      state,
      adoptUser: (user) => dispatch({ type: "setCurrentUser", user }),
      logout: () => {
        dispatch({ type: "logout" });
        void createBrowserSupabase().auth.signOut();
      },
      createCompany: async (name) => {
        const company = { id: crypto.randomUUID(), name: name.trim() };
        const { error } = await createBrowserSupabase().from("companies").insert(company);
        check(error);
        dispatch({ type: "addCompany", company });
        setSyncError(null);
        return company;
      },
      saveProperty: async (property) => {
        const supabase = createBrowserSupabase();
        const exists = state.properties.some((item) => item.id === property.id);
        const { error } = exists
          ? await supabase.from("properties").update(propertyToRow(property)).eq("id", property.id)
          : await supabase.from("properties").insert(propertyToRow(property));
        check(error);
        dispatch({ type: "upsertProperty", property });
        setSyncError(null);
      },
      submitProperty: async (id) => {
        const submittedAt = nowIso();
        const { error } = await createBrowserSupabase()
          .from("properties")
          .update({
            status: "submitted",
            submitted_at: submittedAt,
            updated_at: submittedAt,
            reject_reason: null,
          })
          .eq("id", id);
        check(error);
        dispatch({ type: "submitProperty", id });
        setSyncError(null);
      },
      rejectProperty: async (id, reason) => {
        const updatedAt = nowIso();
        const { error } = await createBrowserSupabase()
          .from("properties")
          .update({ status: "rejected", reject_reason: reason, updated_at: updatedAt })
          .eq("id", id);
        check(error);
        dispatch({ type: "rejectProperty", id, reason });
        setSyncError(null);
      },
      updateReview: async (id, payload) => {
        const reviewedAt = nowIso();
        const current = state.properties.find((item) => item.id === id);
        const { error } = await createBrowserSupabase()
          .from("properties")
          .update({
            masked_fields: payload.maskedFields,
            broadcast_format: payload.broadcastFormat,
            custom_message: payload.customMessage,
            status: current?.status === "submitted" ? "ready" : current?.status,
            reviewed_at: reviewedAt,
            updated_at: reviewedAt,
          })
          .eq("id", id);
        check(error);
        dispatch({ type: "updateReview", id, ...payload });
        setSyncError(null);
      },
      sendBroadcast: async (id) => {
        const property = state.properties.find((item) => item.id === id);
        if (!property) {
          setSyncError("物件が見つかりません");
          throw new Error("物件が見つかりません");
        }
        const response = await fetch("/api/line/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: id }),
        });
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          broadcastId?: string;
          sentAt?: string;
          recipientCount?: number;
          messageText?: string;
        } | null;
        if (!response.ok || !body?.broadcastId || !body.sentAt || body.messageText == null) {
          const message = body?.error || "LINEへの配信に失敗しました";
          setSyncError(message);
          throw new Error(message);
        }
        dispatch({
          type: "sendBroadcast",
          id,
          broadcastId: body.broadcastId,
          sentAt: body.sentAt,
          recipientCount: body.recipientCount ?? 0,
          messageText: body.messageText,
        });
        setSyncError(null);
        return body.broadcastId;
      },
      saveOwner: async (owner) => {
        const supabase = createBrowserSupabase();
        const exists = state.owners.some((item) => item.id === owner.id);
        const { error } = exists
          ? await supabase
              .from("owners")
              .update({
                name: owner.name,
                email: owner.email,
                affiliation: owner.affiliation,
                status: owner.status,
              })
              .eq("id", owner.id)
          : await supabase.from("owners").insert({
              id: owner.id,
              name: owner.name,
              email: owner.email,
              affiliation: owner.affiliation,
              status: owner.status,
              created_at: owner.createdAt,
            });
        check(error);
        if (!exists) {
          const { error: linkError } = await supabase.from("owner_properties").insert(
            owner.propertyIds.map((propertyId) => ({
              owner_id: owner.id,
              property_id: propertyId,
            })),
          );
          check(linkError);
        }
        dispatch({ type: "upsertOwner", owner });
        setSyncError(null);
      },
      setOwnerStatus: async (id, status) => {
        const { error } = await createBrowserSupabase().from("owners").update({ status }).eq("id", id);
        check(error);
        dispatch({ type: "setOwnerStatus", id, status });
        setSyncError(null);
      },
      loginOwner: (ownerId) => dispatch({ type: "loginOwner", ownerId }),
    };
  }, [ready, state, syncError]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

export function useRequiredUser(): User {
  const { state } = useStore();
  if (!state.currentUser) {
    throw new Error("ログインが必要です");
  }
  return state.currentUser;
}

export function emptyProperty(user: User): Property {
  return {
    id: crypto.randomUUID(),
    companyId: user.companyId ?? "",
    companyName: user.companyName ?? "",
    status: "draft",
    name: "",
    buildingName: "",
    prefecture: "東京都",
    city: "",
    town: "",
    addressDetail: "",
    roomNumber: "",
    floor: 1,
    totalFloors: 1,
    layout: "2LDK",
    area: 60,
    balconyArea: 8,
    builtYear: 2018,
    builtMonth: 4,
    direction: "南",
    station: "",
    walkMinutes: 7,
    price: 5000,
    managementFee: 15000,
    reserveFund: 12000,
    highlights: [""],
    notes: "",
    images: [],
    petAllowed: false,
    maskedFields: ["addressDetail", "roomNumber"],
    broadcastFormat: "bullets",
    customMessage: "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

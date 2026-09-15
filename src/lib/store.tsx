"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { buildLineMessage, newId, nowIso } from "./format";
import { initialState, users } from "./seed";
import type {
  AppState,
  BroadcastFormat,
  MaskableField,
  Property,
  ReactionType,
  User,
} from "./types";

const STORAGE_KEY = "aqualine-store-v1";

type Action =
  | { type: "hydrate"; payload: AppState }
  | { type: "login"; userId: string }
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
  | { type: "sendBroadcast"; id: string; broadcastId: string }
  | {
      type: "addReaction";
      propertyId: string;
      broadcastId: string;
      memberId?: string;
      reactionType: ReactionType;
      stamp?: string;
      message?: string;
    };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "login":
      return {
        ...state,
        currentUser: users.find((user) => user.id === action.userId) ?? null,
      };
    case "logout":
      return { ...state, currentUser: null };
    case "reset":
      return { ...initialState, currentUser: state.currentUser };
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
        sentAt: nowIso(),
        format: property.broadcastFormat,
        recipientCount: state.members.length + 236,
        messageText: buildLineMessage(property),
      };
      return {
        ...state,
        properties: state.properties.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: "broadcasted",
                broadcastedAt: nowIso(),
                updatedAt: nowIso(),
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
            id: newId("r"),
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
    default:
      return state;
  }
}

type StoreContextValue = {
  ready: boolean;
  state: AppState;
  login: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  saveProperty: (property: Property) => void;
  submitProperty: (id: string) => void;
  rejectProperty: (id: string, reason: string) => void;
  updateReview: (
    id: string,
    payload: {
      maskedFields: MaskableField[];
      broadcastFormat: BroadcastFormat;
      customMessage: string;
    },
  ) => void;
  sendBroadcast: (id: string) => string;
  addReaction: (payload: {
    propertyId: string;
    broadcastId: string;
    memberId?: string;
    reactionType?: ReactionType;
    stamp?: string;
    message?: string;
  }) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppState;
        dispatch({
          type: "hydrate",
          payload: {
            ...initialState,
            ...parsed,
            members: initialState.members,
          },
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    hydrated.current = true;
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ready,
      state,
      login: (userId) => {
        const next = {
          ...state,
          currentUser: users.find((user) => user.id === userId) ?? null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        dispatch({ type: "login", userId });
      },
      logout: () => dispatch({ type: "logout" }),
      resetDemo: () => dispatch({ type: "reset" }),
      saveProperty: (property) => dispatch({ type: "upsertProperty", property }),
      submitProperty: (id) => dispatch({ type: "submitProperty", id }),
      rejectProperty: (id, reason) => dispatch({ type: "rejectProperty", id, reason }),
      updateReview: (id, payload) => dispatch({ type: "updateReview", id, ...payload }),
      sendBroadcast: (id) => {
        const broadcastId = newId("b");
        dispatch({ type: "sendBroadcast", id, broadcastId });
        return broadcastId;
      },
      addReaction: ({
        propertyId,
        broadcastId,
        memberId,
        reactionType = "like",
        stamp,
        message,
      }) => {
        dispatch({
          type: "addReaction",
          propertyId,
          broadcastId,
          memberId,
          reactionType,
          stamp,
          message,
        });
      },
    }),
    [ready, state],
  );

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
    id: newId("p"),
    companyId: user.companyId ?? "unknown",
    companyName: user.companyName ?? "管理会社",
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

export type Role = "company" | "admin";

export type User = {
  id: string;
  name: string;
  role: Role;
  companyId?: string;
  companyName?: string;
  title: string;
};

export type PropertyStatus =
  | "draft"
  | "submitted"
  | "rejected"
  | "ready"
  | "broadcasted";

export type MaskableField =
  | "addressDetail"
  | "roomNumber"
  | "price"
  | "buildingName"
  | "managementFee"
  | "ownerNote";

export type BroadcastFormat = "bullets" | "card" | "pdf";

export type ReactionType = "like" | "stamp" | "text";

export type Property = {
  id: string;
  companyId: string;
  companyName: string;
  status: PropertyStatus;
  name: string;
  buildingName: string;
  prefecture: string;
  city: string;
  town: string;
  addressDetail: string;
  roomNumber: string;
  floor: number;
  totalFloors: number;
  layout: string;
  area: number;
  balconyArea?: number;
  builtYear: number;
  builtMonth: number;
  direction: string;
  station: string;
  walkMinutes: number;
  price: number;
  managementFee: number;
  reserveFund: number;
  highlights: string[];
  notes: string;
  images: string[];
  pdfName?: string;
  petAllowed: boolean;
  maskedFields: MaskableField[];
  broadcastFormat: BroadcastFormat;
  customMessage: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  broadcastedAt?: string;
};

export type Broadcast = {
  id: string;
  propertyId: string;
  sentAt: string;
  format: BroadcastFormat;
  recipientCount: number;
  messageText: string;
};

export type Member = {
  id: string;
  displayName: string;
  lineId: string;
  initial: string;
  hue: number;
  registeredAt: string;
  source: string;
};

export type Reaction = {
  id: string;
  broadcastId: string;
  propertyId: string;
  memberId: string;
  type: ReactionType;
  stamp?: string;
  message?: string;
  createdAt: string;
};

export type AppState = {
  currentUser: User | null;
  properties: Property[];
  broadcasts: Broadcast[];
  reactions: Reaction[];
  members: Member[];
};

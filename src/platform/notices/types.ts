export type NoticeKind =
  | "banner"
  | "modal"
  | "toast"
  | "inline"
  | "announcement";

export type NoticePlacement =
  | "global"
  | "marketing"
  | "dashboard"
  | "creator_site"
  | "admin"
  | "support"
  | "auth";

export type NoticeStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "ended"
  | "archived";

export type NoticeInteraction =
  | "impression"
  | "dismissed"
  | "clicked"
  | "converted";

export interface NoticeAction {
  label: string;
  href?: string;
  eventName?: string;
  external?: boolean;
}

export interface Notice {
  id: string;
  key: string;
  title: string;
  body: string;
  kind: NoticeKind;
  placement: NoticePlacement;
  priority: number;
  status: NoticeStatus;
  startsAt: string | null;
  endsAt: string | null;
  dismissible: boolean;
  cooldownSeconds: number | null;
  maxImpressions: number | null;
  audience: Record<string, unknown>;
  eligibility: Record<string, unknown>;
  action: NoticeAction;
  campaignId: string | null;
}

export interface NoticeContext {
  route: string;
  creatorId?: string;
  authenticated: boolean;
  locale?: string;
  reducedMotion?: boolean;
}

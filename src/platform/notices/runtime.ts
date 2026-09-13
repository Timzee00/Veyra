import type { Notice, NoticeContext } from "./types";

export function isNoticeWithinWindow(notice: Notice, now = new Date()): boolean {
  if (notice.status !== "active") return false;
  if (notice.startsAt && new Date(notice.startsAt) > now) return false;
  if (notice.endsAt && new Date(notice.endsAt) <= now) return false;
  return true;
}

export function matchesNoticeContext(notice: Notice, context: NoticeContext): boolean {
  if (!isNoticeWithinWindow(notice)) return false;

  const route = notice.audience.route;
  const locale = notice.audience.locale;
  const authenticated = notice.audience.authenticated;

  if (typeof route === "string" && route !== "*" && !context.route.startsWith(route)) return false;
  if (typeof locale === "string" && locale !== context.locale) return false;
  if (typeof authenticated === "boolean" && authenticated !== context.authenticated) return false;
  if (context.reducedMotion && notice.kind === "toast" && notice.eligibility.animation === "required") return false;

  return true;
}

export function sortNotices(notices: Notice[], context: NoticeContext): Notice[] {
  return notices
    .filter((notice) => matchesNoticeContext(notice, context))
    .sort((a, b) => b.priority - a.priority);
}

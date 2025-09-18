import { env } from "~/config/environment";

// Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // "http://localhost:5173"
  "https://trellodnd.netlify.app",
];
// không cần localhost nữa vì ở file config/cors đã luôn luôn cho phép môi trường dev

export const BOARD_TYPE = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEM_PER_PAGE = 12;

export const INVITATION_TYPES = {
  BOARD_INVITATION: "BOARD_INVITATION",
};
export const BOARD_INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

export const CARD_MEMBER_ACTIONS = {
  ADD: "ADD",
  REMOVE: "REMOVE",
};

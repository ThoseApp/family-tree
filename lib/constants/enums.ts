export enum BucketFolderEnum {
  users = "users",
  gallery = "gallery",
  notice_boards = "notice_boards",
  avatars = "avatars",
  EVENT_IMAGES = "event_images",
  landing_page = "landing_page",
  cdn = "cdn",

  // TODO: ADD MORE FOLDER NAMES
}

export enum UserRoleEnum {
  admin = "admin",
  publisher = "publisher",
  user = "user",
}

export enum NotificationTypeEnum {
  member_request = "member_request",
  gallery_request = "gallery_request",
  gallery_approved = "gallery_approved",
  gallery_declined = "gallery_declined",
  notice_board_request = "notice_board_request",
  notice_board_approved = "notice_board_approved",
  notice_board_declined = "notice_board_declined",
  event_invitation = "event_invitation",
  event = "event",
  event_request = "event_request",
  event_approved = "event_approved",
  event_declined = "event_declined",
}

export enum GalleryStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum NoticeBoardStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum EventStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum UserStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum LifeStatusEnum {
  deceased = "Deceased",
  accountEligible = "Account Eligible",
  child = "Child",
}

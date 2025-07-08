export enum BucketFolderEnum {
  users = "users",
  gallery = "gallery",
  notice_boards = "notice_boards",
  avatars = "avatars",
  EVENT_IMAGES = "event_images",
  landing_page = "landing_page",

  // TODO: ADD MORE FOLDER NAMES
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

export enum UserStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

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
  event = "event",
  notice_board = "notice_board",
  gallery = "gallery",
  gallery_request = "gallery_request", // admin notification type
  gallery_approved = "gallery_approved", // user notification when admin approves
  gallery_declined = "gallery_declined", // user notification when admin declines
  family_member_request = "family_member_request", // admin notification type

  // TODO: ADD MORE NOTIFICATION TYPES
}

export enum GalleryStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum UserStatusEnum {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

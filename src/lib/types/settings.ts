export interface UserSettings {
  organizationName: string;
  organizationId: string;
  contactEmail: string;
  owner: OwnerProfile;
  notifications: NotificationPreferences;
}

export interface OwnerProfile {
  name: string;
  title: string;
  email: string;
}

export interface NotificationPreferences {
  emailDigest: boolean;
  smsCritical: boolean;
  systemPush: boolean;
  eventSubscriptions: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

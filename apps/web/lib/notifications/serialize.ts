import type { PushSubscriptionRow } from "@tend/db";

export interface PushSubscriptionResponse {
  id: string;
  token: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

export function serializePushSubscription(
  subscription: PushSubscriptionRow,
): PushSubscriptionResponse {
  return {
    id: subscription.id,
    token: subscription.token,
    platform: subscription.platform,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

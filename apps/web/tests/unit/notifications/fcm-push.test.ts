import { beforeEach, describe, expect, it } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import {
  resetFcmAccessTokenCacheForTests,
  sendFcmPushNotification,
} from "@/lib/notifications/fcm-push";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();

function fcmEnv() {
  return {
    FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@test-project.iam.gserviceaccount.com",
    FIREBASE_PRIVATE_KEY: privateKeyPem,
    FIREBASE_PROJECT_ID: "test-project",
  };
}

describe("sendFcmPushNotification", () => {
  beforeEach(() => {
    resetFcmAccessTokenCacheForTests();
  });

  it("returns ok when FCM accepts the message", async () => {
    const calls: string[] = [];
    const result = await sendFcmPushNotification(
      {
        to: "native-fcm-token",
        title: "Medication could use tending",
        body: "Marked as a must, so Tend keeps it easy to see.",
        data: { itemId: "item-1" },
      },
      {
        env: fcmEnv(),
        fetchFn: async (input, init) => {
          calls.push(input);
          if (input === "https://oauth2.googleapis.com/token") {
            expect(init.method).toBe("POST");
            return Response.json({ access_token: "access-token", expires_in: 3600 });
          }

          expect(input).toBe("https://fcm.googleapis.com/v1/projects/test-project/messages:send");
          expect(init.headers).toMatchObject({ Authorization: "Bearer access-token" });
          expect(JSON.parse(String(init.body))).toMatchObject({
            message: {
              token: "native-fcm-token",
              notification: {
                title: "Medication could use tending",
              },
              data: { itemId: "item-1" },
            },
          });
          return Response.json({ name: "projects/test-project/messages/message-id" });
        },
      },
    );

    expect(calls).toEqual([
      "https://oauth2.googleapis.com/token",
      "https://fcm.googleapis.com/v1/projects/test-project/messages:send",
    ]);
    expect(result).toEqual({ ok: true, invalidToken: false, error: null });
  });

  it("flags unregistered devices for token cleanup", async () => {
    const result = await sendFcmPushNotification(
      {
        to: "native-fcm-token",
        title: "Medication could use tending",
        body: "Marked as a must, so Tend keeps it easy to see.",
        data: { itemId: "item-1" },
      },
      {
        env: fcmEnv(),
        fetchFn: async (input) => {
          if (input === "https://oauth2.googleapis.com/token") {
            return Response.json({ access_token: "access-token", expires_in: 3600 });
          }

          return Response.json(
            {
              error: {
                status: "NOT_FOUND",
                message: "Requested entity was not found.",
                details: [
                  {
                    "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
                    errorCode: "UNREGISTERED",
                  },
                ],
              },
            },
            { status: 404 },
          );
        },
      },
    );

    expect(result).toEqual({
      ok: false,
      invalidToken: true,
      error: "UNREGISTERED",
    });
  });

  it("reports missing service account configuration", async () => {
    const result = await sendFcmPushNotification(
      {
        to: "native-fcm-token",
        title: "Medication could use tending",
        body: "Marked as a must, so Tend keeps it easy to see.",
        data: { itemId: "item-1" },
      },
      { env: {} },
    );

    expect(result).toEqual({
      ok: false,
      invalidToken: false,
      error:
        "FCM is not configured; missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    });
  });
});

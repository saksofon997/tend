import { describe, expect, it } from "bun:test";
import { sendExpoPushNotification } from "@/lib/notifications/expo-push";

describe("sendExpoPushNotification", () => {
  it("returns ok for accepted Expo push messages", async () => {
    const result = await sendExpoPushNotification(
      {
        to: "ExpoPushToken[test-token]",
        title: "Medication could use tending",
        body: "Marked as a must, so Tend keeps it easy to see.",
        data: { itemId: "item-1" },
      },
      async () =>
        new Response(JSON.stringify({ data: { status: "ok", id: "ticket-1" } }), {
          status: 200,
        }),
    );

    expect(result).toEqual({ ok: true, invalidToken: false, error: null });
  });

  it("flags unregistered devices for token cleanup", async () => {
    const result = await sendExpoPushNotification(
      {
        to: "ExpoPushToken[test-token]",
        title: "Medication could use tending",
        body: "Marked as a must, so Tend keeps it easy to see.",
        data: { itemId: "item-1" },
      },
      async () =>
        new Response(
          JSON.stringify({
            data: {
              status: "error",
              message: "Device is not registered",
              details: { error: "DeviceNotRegistered" },
            },
          }),
          { status: 200 },
        ),
    );

    expect(result).toEqual({
      ok: false,
      invalidToken: true,
      error: "DeviceNotRegistered",
    });
  });
});

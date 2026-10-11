export type ParsedPushNotification = {
  title: string;
  message: string;
  href: string | null;
};

type PushData = Record<string, string | undefined> | undefined;

function readDataString(data: PushData, ...keys: string[]): string {
  if (!data) return '';
  for (const key of keys) {
    const value = data[key]?.trim();
    if (value) return value;
  }
  return '';
}

/** Normalize FCM / service-worker push payloads for in-app toast UI. */
export function parsePushPayload(payload: {
  notification?: { title?: string; body?: string };
  data?: PushData;
}): ParsedPushNotification | null {
  const title =
    payload.notification?.title?.trim()
    ?? readDataString(payload.data, 'title')
    ?? '';
  const message =
    payload.notification?.body?.trim()
    ?? readDataString(payload.data, 'body', 'message')
    ?? '';
  const href =
    readDataString(payload.data, 'linkPath', 'link_path')
    || null;

  if (!title && !message) return null;

  return {
    title: title || message,
    message: title ? message : '',
    href,
  };
}

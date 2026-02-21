const ICON_PATH = "/icon512_rounded.png";
const BADGE_PATH = "/icon512_rounded.png";

self.addEventListener("push", event => {
  let data;

  try {
    data = event.data
      ? event.data.json()
      : {
          title: "Ichipiro+",
          body: "新しい通知があります",
          url: "/",
        };
  } catch {
    data = {
      title: "Ichipiro+",
      body: "新しい通知があります",
      url: "/",
    };
  }

  const options = {
    body: data.body,
    icon: ICON_PATH,
    badge: BADGE_PATH,
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    tag: data.tag || `ichipiro-notification-${Date.now()}`,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url ?? "/";
  event.waitUntil(openUrl(urlToOpen));
});

self.addEventListener("message", event => {
  if (event.data?.type !== "SHOW_TEST_NOTIFICATION") {
    return;
  }

  const { title, body, url } = event.data;
  self.registration.showNotification(title || "テスト通知", {
    body: body || "これはテスト通知です",
    icon: ICON_PATH,
    badge: BADGE_PATH,
    data: { url: url || "/" },
    vibrate: [200, 100, 200],
  });
});

async function openUrl(url) {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    if (client.url.includes(url) || url.includes(client.url)) {
      await client.focus();
      if (client.url !== url) {
        return client.navigate(url);
      }
      return client;
    }
  }

  return clients.openWindow(url);
}

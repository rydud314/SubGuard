// SubGuard 브라우저 푸시 알림용 서비스워커.
// 서버(/api/cron/notify)가 보낸 푸시 이벤트를 받아 알림을 띄우고, 클릭 시 앱으로 포커스 이동시킨다.

self.addEventListener("push", (event) => {
  let payload = { title: "SubGuard", body: "알림이 도착했어요." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // JSON이 아니면 기본 문구를 그대로 사용
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

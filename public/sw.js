/* eslint-disable no-restricted-globals */
const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

self.addEventListener('activate', async () => {
  // This will be called only once when the service worker is activated.
  try {
    const applicationServerKey = urlB64ToUint8Array(await fetch('/api/subscription/vapid').then((res) => res.json()).then((json) => json.vapid));
    const subscription = await self.registration.pushManager.subscribe({
      applicationServerKey,
      userVisibleOnly: true,
    });
    await fetch('/api/subscription', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
  } catch (err) {
    console.log('Error', err);
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    console.log('Push event!! ', event.data.text());
  } else {
    console.log('Push event but no data');
  }
});

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

self.addEventListener('push', async (event) => {
  if (event.data) {
    const eventData = JSON.parse(event.data.text());
    switch (eventData.type) {
      case 'new_mail':
        const mailData = await fetch(`/api/mails/${eventData.id}`).then((res) => res.json());
        self.registration.showNotification(mailData.subject || '<No Subject>', {
          body: `From: ${mailData.from}
To: ${mailData.folder.address.name}`,
          tag: `MAILRECEPTION-${eventData.id}-${mailData.folder.address.name}`,
        });
        break;
      default:
        break;
    }
  } else {
    console.log('Push event but no data');
  }
});

const getFolderName = (folder) => (folder.type !== 'Other' ? folder.type : folder.name);

self.addEventListener('notificationclick', async (event) => {
  const [notifType, ...notifData] = event.notification.tag.split('-');
  switch (notifType) {
    case 'MAILRECEPTION':
      event.waitUntil((async () => {
        const mailData = await fetch(`/api/mails/${notifData[0]}`).then((res) => res.json());
        // const convo = await fetch(`/api/convos/${mailData.convoId}`).then((res) => res.json());
        const folder = await fetch(`/api/folders/${mailData.folderId}`).then((res) => res.json());
        self.clients.openWindow(`/${notifData[1]}/${getFolderName(folder)}/${notifData[0]}`);
      })());
      break;
    default:
      console.error('No such notification type:', notifType);
  }
});

self.addEventListener('install', () => self.skipWaiting());

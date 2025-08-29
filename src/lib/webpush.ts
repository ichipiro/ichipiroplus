import webpush from "web-push";

// VAPID設定
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT || "mailto:admin@ichipiroplus.com",
};

// webpushの設定
webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey as string,
  vapidDetails.privateKey as string
);

export { vapidDetails, webpush };

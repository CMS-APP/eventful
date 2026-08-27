export async function sendExpoNotifications(db, hostId, title, body) {
  // Fetch host's Expo push tokens
  const hostDoc = await db.collection("user").doc(hostId).get();

  if (!hostDoc.exists) {
    console.log("Host not found");
    return;
  }

  const hostData = hostDoc.data();
  const expoPushTokens = hostData.pushTokens || [];

  // Filter valid tokens
  const validTokens = expoPushTokens.filter(
    (token) =>
      typeof token === "string" && token.startsWith("ExponentPushToken"),
  );

  if (validTokens.length === 0) {
    console.log("No valid Expo push tokens for host");
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title: title,
    body: body,
  }));

  try {
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await expoResponse.json();
    console.log("Expo notifications sent:", result);
  } catch (notifError) {
    console.warn("Error sending Expo notifications:", notifError);
  }
}

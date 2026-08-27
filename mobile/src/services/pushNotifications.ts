import { Alert, Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { textFormatter } from "@/design-system/tokens/fonts";
import { Event } from "@/types/Event";
import { EventInvite } from "@/types/EventInvite";
import { User } from "@/types/User";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C"
    });
  }

  if (!Device || !Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert(
      "Request Unsuccessful",
      "Please enable push notifications in your settings."
    );
    return null;
  } else {
    return await getExpoToken();
  }
}

export async function getExpoToken() {
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    return null;
  }
  return (
    await Notifications.getExpoPushTokenAsync({
      projectId
    })
  ).data;
}

async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number,
  data: any,
  identifier?: string
) {
  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(Date.now() + seconds * 1000)
  };

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data
    },
    trigger,
    identifier
  });
}

async function schedulePushNotification(
  user: User,
  title: string,
  body: string,
  data: any
) {
  const tokens = user.pushTokens;
  if (tokens) {
    const messages = tokens.map((token) => ({
      to: token,
      title,
      body,
      data
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages)
    });
  }
}

export async function sendFollowNotification(user: User, sender: User) {
  const data = {
    screen: "ContactView",
    params: { user: user, type: "contact" }
  };

  await schedulePushNotification(
    user,
    `${sender.name} (${sender.username}) followed you!`,
    "Open the app to see their profile",
    data
  );
}

export async function sendInviteNotification(
  user: User,
  host: User,
  event: Event,
  invite: EventInvite
) {
  await schedulePushNotification(
    user,
    textFormatter(event.name.trim(), 50, "Event Invite"),
    `${host.name} (${host.username}) invited you to a new event`,
    {
      screen: "EventInvite",
      params: { event, invite, host }
    }
  );
}

export async function updateResponseNotification(
  user: User,
  name: string,
  username: string,
  event: Event,
  response: string
) {
  let responseMessage = "";

  switch (response) {
    case "accept":
      responseMessage = `${name} (${username}) accepted your invite`;
      break;
    case "decline":
      responseMessage = `${name} (${username}) declined your invite`;
      break;
    case "maybe":
      responseMessage = `${name} (${username}) has marked your invite as maybe`;
      break;
    default:
      responseMessage = `${name} (${username}) changed their response to your invite`;
      break;
  }

  const data = {
    screen: "EventEdit",
    params: { event }
  };

  await schedulePushNotification(
    user,
    `${textFormatter(event.name.trim(), 50, "Event")}`,
    responseMessage,
    data
  );
}

export async function clearNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}

async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function cancelNotificationsForEvent(eventId: string) {
  if (!eventId) return;
  log("Cancelling notifications for event " + eventId, "info");

  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  const eventNotificationIds = scheduledNotifications
    .filter((notification) => {
      return notification.identifier?.startsWith(`event-${eventId}-`);
    })
    .map((notification) => notification.identifier)
    .filter((id): id is string => id !== undefined);

  if (eventNotificationIds.length > 0) {
    await Promise.all(
      eventNotificationIds.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id)
      )
    );
  }
}

export async function createNotificationsForEvents(upcomingEvents: Event[]) {
  await cancelAllScheduledNotifications();

  if (upcomingEvents.length > 0) {
    for (const event of upcomingEvents) {
      await createNotificationForEvent(event);
    }
  }
}

export async function updateNotificationsForEvent(event: Event) {
  await cancelNotificationsForEvent(event.id || "");
  await createNotificationForEvent(event);
}

async function scheduleToDoShoppingNotification(event: Event, seconds: number) {
  const toDoList = event.toDoList;
  const shoppingList = event.shoppingList;

  const toDoItems = toDoList.filter((item) => item.complete === false);
  const shoppingItems = shoppingList.filter((item) => item.complete === false);

  if (toDoItems.length > 0 || shoppingItems.length > 0) {
    let title = textFormatter(event.name.trim(), 50, "Event") + " in one week";

    let body = "";
    if (toDoItems.length > 0) {
      body += "To Do List Items remaining: " + toDoItems.length + "\n";
    }

    if (shoppingItems.length > 0) {
      body += "Shopping List Items remaining: " + shoppingItems.length;
    }

    const data = {
      screen: "EventEdit",
      params: { event }
    };

    const identifier = `event-${event.id}-week`;
    await scheduleLocalNotification(title, body, seconds, data, identifier);
    return true;
  }
  return false;
}

export async function createNotificationForEvent(event: Event) {
  log("Creating notification for event " + event.id, "debug");

  const reminders = [
    { label: "in One Hour!", hours: 1, type: "hour" },
    { label: "Tomorrow!", days: 1, type: "day" },
    { label: "in One Week!", days: 7, type: "week" }
  ];

  const data = {
    screen: "EventEdit",
    params: { event }
  };

  for (const reminder of reminders) {
    const date = parseDatabaseDate(event.date);
    if (reminder.days) {
      date.setDate(date.getDate() - reminder.days);
    } else if (reminder.hours) {
      date.setHours(date.getHours() - reminder.hours);
    }

    const seconds = Math.floor((date.getTime() - new Date().getTime()) / 1000);
    if (seconds > 0) {
      let sent = false;
      if (reminder.label === "in one week") {
        sent = await scheduleToDoShoppingNotification(event, seconds);
      }

      if (!sent) {
        const identifier = `event-${event.id}-${reminder.type}`;
        await scheduleLocalNotification(
          "Event Reminder",
          `You have ${textFormatter(event.name.trim(), 50, "an event")} coming up ${reminder.label}`,
          seconds,
          data,
          identifier
        );
      }
    }
  }
}

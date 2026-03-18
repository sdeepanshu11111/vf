import { ObjectId } from "mongodb";

function isObjectId(value) {
  return value instanceof ObjectId;
}

export function toIdString(value) {
  if (value == null) return value;
  if (typeof value === "string") return value;
  if (isObjectId(value)) return value.toString();
  return value;
}

export function serializeIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => serializeIds(item));
  }

  if (value instanceof Date || value == null) {
    return value;
  }

  if (isObjectId(value)) {
    return value.toString();
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeIds(nestedValue),
      ]),
    );
  }

  return value;
}

export function serializeUser(user) {
  if (!user) return null;

  const serialized = serializeIds(user);

  return {
    ...serialized,
    followerCount: serialized.followers?.length || 0,
    followingCount: serialized.following?.length || 0,
  };
}

export function serializePost(post) {
  if (!post) return null;
  return serializeIds(post);
}

export function serializeNotification(notification) {
  if (!notification) return null;
  return serializeIds(notification);
}

export function serializeConversation(conversation) {
  if (!conversation) return null;
  return serializeIds(conversation);
}

export function serializeMessage(message) {
  if (!message) return null;
  return serializeIds(message);
}

import mongoose, { Schema, model, type HydratedDocument } from "mongoose";

type EventType = {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

type EventDocument = HydratedDocument<EventType>;

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "event";
};

const normalizeDate = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date is invalid.");
  }

  return parsedDate.toISOString();
};

const normalizeTime = (value: string): string => {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^([0-9]{1,2}):([0-9]{2})\s*(AM|PM)?$/i);

  if (!match) {
    throw new Error("Event time must be in a valid HH:MM or H:MM AM/PM format.");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minutes > 59 || hours < 1 || hours > 12) {
    throw new Error("Event time is invalid.");
  }

  const normalizedHours = period
    ? (() => {
        if (period === "AM") {
          return hours === 12 ? 0 : hours;
        }

        return hours === 12 ? 12 : hours + 12;
      })()
    : hours;

  return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const eventSchema = new Schema<EventType>(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required."],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required."],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required."],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required."],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required."],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required."],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required."],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "Agenda must contain at least one item.",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required."],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required."],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "Tags must contain at least one item.",
      },
    },
  },
  {
    timestamps: true,
    collection: "events",
  }
);

// Slug is unique and used as a stable URL-friendly identifier.
eventSchema.index({ slug: 1 }, { unique: true });

// Before saving, generate a slug from the title and keep it stable unless the title changes.
eventSchema.pre("save", async function () {
  const eventDoc = this as EventDocument;

  const requiredFields: Array<keyof EventType> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredFields) {
    const value = eventDoc[field];

    if (typeof value === "string" && !value.trim()) {
      throw new Error(`${String(field)} cannot be empty.`);
    }

    if (field === "agenda" || field === "tags") {
      const list = eventDoc[field] as string[] | undefined;

      if (!Array.isArray(list) || list.length === 0 || list.some((item) => !item.trim())) {
        throw new Error(`${String(field)} must contain non-empty values.`);
      }
    }
  }

  if (eventDoc.isModified("title")) {
    eventDoc.slug = slugify(eventDoc.title);
  } else if (!eventDoc.slug || !eventDoc.slug.trim()) {
    eventDoc.slug = slugify(eventDoc.title);
  }

  // Normalize dates to ISO for predictable comparisons and storage across all environments.
  eventDoc.date = normalizeDate(eventDoc.date.trim());

  // Keep event times consistent in 24-hour format.
  eventDoc.time = normalizeTime(eventDoc.time);
});

const Event = model<EventType>("Event", eventSchema);

export default Event;
export type { EventDocument, EventType };

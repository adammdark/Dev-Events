import mongoose, { Schema, model, type HydratedDocument } from "mongoose";

type BookingType = {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type BookingDocument = HydratedDocument<BookingType>;

const bookingSchema = new Schema<BookingType>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required."],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Please provide a valid email address.",
      },
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

// Booking queries are most often filtered by the event ID, so this index keeps lookups efficient.
bookingSchema.index({ eventId: 1 });

// Ensure the booking references an actual event before persisting it.
bookingSchema.pre("save", async function () {
  const bookingDoc = this as BookingDocument;

  if (!bookingDoc.email || !bookingDoc.email.trim()) {
    throw new Error("Email cannot be empty.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingDoc.email.trim())) {
    throw new Error("Please provide a valid email address.");
  }

  if (!bookingDoc.eventId) {
    throw new Error("Event reference is required.");
  }

  const eventExists = await mongoose.model("Event").findById(bookingDoc.eventId);

  if (!eventExists) {
    throw new Error("Referenced event does not exist.");
  }
});

const Booking = model<BookingType>("Booking", bookingSchema);

export default Booking;
export type { BookingDocument, BookingType };

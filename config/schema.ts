import {
  integer,
  pgTable,
  varchar,
  boolean,
  date,
  text,
  timestamp,
  decimal,
  json,
  time,
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  isProfileCompleted: boolean("is_profile_completed").notNull().default(false),
  phoneNumber: varchar("phone_number"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 50 }),
  address: text("address"),
  city: varchar("city"),
  role: varchar()
    .notNull()
    .$default(() => "patient"),
});

export const Patients = pgTable("patients", {
  email: varchar("email")
    .notNull()
    .references(() => Users.email, {
      onDelete: "cascade",
    })
    .unique(),
  medicalSummary: text("medical_summary"),
  medicalCondition: json("medical_condition"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const Doctors = pgTable("doctors", {
  email: varchar("email")
    .notNull()
    .references(() => Users.email, {
      onDelete: "cascade",
    })
    .unique(),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  qualifications: text("qualifications"),
  licenseNumber: varchar("license_number", { length: 100 }).notNull().unique(),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  workingHours: json("working_hours"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const medicalReport = pgTable("medicalReport", {
  email: varchar("email")
    .notNull()
    .references(() => Users.email, {
      onDelete: "cascade",
    })
    .unique(),
  content: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const Appointments = pgTable("appointments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  patientEmail: varchar("patient_email", { length: 255 })
    .notNull()
    .references(() => Users.email, { onDelete: "cascade" }),
  doctorEmail: varchar("doctor_email", { length: 255 })
    .notNull()
    .references(() => Users.email, { onDelete: "cascade" }),
  date: date("appointment_date").notNull(),
  startTime: time("start_time", { precision: 0 }).notNull(),
  endTime: time("end_time", { precision: 0 }).notNull(),
  status: varchar("status", { length: 50 })
    .notNull()
    .$default(() => "pending"), // e.g. pending, confirmed, cancelled, completed
  notes: text("notes"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});


export const ChatSessions = pgTable("chat_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => Users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ChatMessages = pgTable("chat_messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer().references(() => ChatSessions.id, {
    onDelete: "cascade",
  }),
  sender: varchar("sender", { length: 50 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
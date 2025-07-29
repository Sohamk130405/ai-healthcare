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
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  isProfileCompleted: boolean("is_profile_completed").notNull().default(false),
  phoneNumber: varchar("phone_number"),
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
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  medicalCondition: json(),
  medicalSummary: text("medical_summary"),
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


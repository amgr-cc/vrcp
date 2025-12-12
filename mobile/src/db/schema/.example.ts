// https://orm.drizzle.team/docs/column-types/sqlite
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const sample = sqliteTable("sample", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").$onUpdateFn(()=>sql`(current_timestamp)`),
  deletedAt: text("deleted_at"),

  sampleInt: integer("sample_int"),
  sampleFloat: real("sample_float"),
  sampleText: text("sample_text"),
  sampleBool: integer("sample_bool", { mode: 'boolean' }).default(false),
  sampleJson: text("sample_json", { mode: 'json' }).$type<{ id:number ,label: string, value: string }[]>().notNull().default([]), //  array of json
  sampleEnum: text("sample_enum", { enum: ["value1", "value2", "value3"] }),

});

// export type DBSample = typeof sample.$inferSelect;
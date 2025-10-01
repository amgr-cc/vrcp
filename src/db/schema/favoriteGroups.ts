// https://orm.drizzle.team/docs/column-types/sqlite
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const favoriteGroupsTable = sqliteTable("favorite_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").$onUpdateFn(()=>sql`(current_timestamp)`),

  name: text("name").notNull().default(""),
  displayName: text("display_name"),
  type: text("type", { enum: ["friend", "world", "avatar"] }),


  option: text("option", { mode: 'json' }).$type<{
    color?: string,
  }>().notNull().default({}),
});

export type DBFavoriteGroup = typeof favoriteGroupsTable.$inferSelect;

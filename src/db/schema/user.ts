// https://orm.drizzle.team/docs/column-types/sqlite
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(), // ex. usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469, legacy, 8JoV9XEdpo
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").$onUpdateFn(()=>sql`(current_timestamp)`),

  displayName: text("display_name"),
  iconUrl: text("icon_url"),
  pictureUrl: text("picture_url"),
  isFriend: integer("is_friend", { mode: 'boolean' }).default(false),
  favoriteGroupId: text("favorite_group_id"),
  option: text("option", { mode: 'json' }).$type<{ 
    color?: string, 
    localNote?:string
   }>().notNull().default({}),
  
});

export type DBUser = typeof usersTable.$inferSelect;
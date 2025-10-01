import { createContext, useContext, useEffect } from "react";
import * as sqlite from "expo-sqlite";
import { drizzle } from 'drizzle-orm/expo-sqlite';
import Constants from 'expo-constants';
import { SQLiteColumn, SQLiteInsertValue, sqliteTable, SQLiteTableWithColumns, SQLiteUpdateSetSource, TableConfig } from "drizzle-orm/sqlite-core";
import { eq, SQL } from "drizzle-orm";
import { avatarsTable, favoriteGroupsTable, groupsTable, sample, usersTable, worldsTable } from "@/db/schema";
// provide db access globally


interface TableWrapper<
  T extends SQLiteTableWithColumns<any>
> {
  get: (id: T["$inferSelect"]["id"]) => Promise<T["$inferSelect"] | null>;
  create: (data: SQLiteInsertValue<T>) => Promise<T["$inferSelect"]>;
  update: (id: T["$inferInsert"]["id"], data: SQLiteUpdateSetSource<T>) => Promise<T["$inferSelect"]>;
  delete: (id: T["$inferSelect"]["id"]) => Promise<boolean>;
}

interface DBContextType {
  db: ReturnType<typeof drizzle>;
  fileName: string;
  users: TableWrapper<typeof usersTable>;
  worlds: TableWrapper<typeof worldsTable>;
  avatars: TableWrapper<typeof avatarsTable>;
  groups: TableWrapper<typeof groupsTable>;
  favoriteGroups: TableWrapper<typeof favoriteGroupsTable>;
}
const Context = createContext<DBContextType | undefined>(undefined);

const useDB = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useDB must be used within a DBProvider");
  return context;
} 

const DBProvider: React.FC<{ children?: React.ReactNode }> = ({
  children
}) => {
  const fileName = Constants.expoConfig?.extra?.vrcmm?.buildProfile !== "production" ? "vrcmm-dev.db" : "vrcmm.db";
  const expoDB = sqlite.openDatabaseSync(fileName);
  const db = drizzle(expoDB);




  // migration on initial load
  useEffect(() => {
    console.log("wwwww:\n", initTableSql(sample));
    // Object.values(migrations.migrations).forEach(mig => {
    //   console.log("Applying migration:", mig);
    // });
    // const tables = [usersTable, worldsTable, avatarsTable, groupsTable, favoriteGroupsTable];
    // const createTableSQLs = tables.map(t => initTableSql(t)).join("\n");
    // expoDB.execAsync(createTableSQLs);
  }, []);

  const wrappers = {
    users: initTableWrapper(db, usersTable),
    worlds: initTableWrapper(db, worldsTable),
    avatars: initTableWrapper(db, avatarsTable),
    groups: initTableWrapper(db, groupsTable),
    favoriteGroups: initTableWrapper(db, favoriteGroupsTable),
  }

  return (
    <Context.Provider value={{
      db, fileName,
      ...wrappers
    }}>
      {children}
    </Context.Provider>
  );
}

const initTableWrapper = <
  T extends TableConfig,
>(
  db: ReturnType<typeof drizzle>, 
  table: SQLiteTableWithColumns<T>
): TableWrapper<SQLiteTableWithColumns<T>> => {
  // if not exist, create table


  // CRUD operations
  const get = async (id: typeof table.$inferSelect['id']): Promise<SQLiteTableWithColumns<T>["$inferSelect"] | null> => {
    const result = await db.select().from(table).where(
      eq(table.id, id)
    ).limit(1).get();
    return result as SQLiteTableWithColumns<T>["$inferSelect"] | null;
  }
  const create = async (data: SQLiteInsertValue<typeof table>): Promise<SQLiteTableWithColumns<T>["$inferSelect"]> => {
    const result = await db.insert(table).values(data).returning().get();
    return result as SQLiteTableWithColumns<T>["$inferSelect"];
  }
  const update = async (id: typeof table.$inferSelect['id'], data: SQLiteUpdateSetSource<typeof table>): Promise<SQLiteTableWithColumns<T>["$inferSelect"]> => {
    const result = await db.update(table).set(data).where(
      eq(table.id, id)
    ).returning().get();
    return result as SQLiteTableWithColumns<T>["$inferSelect"];
  }
  const del = async (id: SQLiteTableWithColumns<T>["$inferSelect"]['id']): Promise<boolean> => {
    const result = await db.delete(table).where(
      eq(table.id, id)
    ).execute();
    return result.changes > 0;
  }

  return { get, create, update, delete: del };
}

const initTableSql = <T extends TableConfig>(table: SQLiteTableWithColumns<T>) => {
    try {
          const columns = Object.values(table);
          // @ts-ignore
          const tableName = table.getSQL().usedTables[0];
          console.log("Table Name:", tableName);
          console.log("Columns:", columns.map(c=>c.name));
          const c = columns[2];
          console.log(
            `\nname: ${c.name}`,
            `\ndataType: ${c.dataType}`,
            `\nisUnique: ${c.isUnique}`,
            `\nhasDefault: ${c.hasDefault}`,
            `\ndefault: ${c.default}`,
            `\nnotNull: ${c.notNull}`,
            `\n_: ${c.primary}`,
          );
          const uniques = [] as string[];
          const columnDefs = columns.map(column => {
            let colDef = `"${column.name}" ${column.columnType}`;
            if (column.primary) colDef += " PRIMARY KEY";
            // if (column._.isAutoincrement) colDef += " AUTOINCREMENT";
            if (column.hasDefault && column.default !== undefined) {
              if (typeof column.default === "string") {
                colDef += ` DEFAULT '${column.default}'`;
              } else if (typeof column.default === "number" || typeof column.default === "boolean") {
                colDef += ` DEFAULT ${column.default}`;
              } else {
                colDef += ` DEFAULT ${column.default?.queryChunks?.[0]?.value?.[0]}`;
              }
            }
            if (column.notNull) colDef += " NOT NULL";
            if (column.isUnique) uniques.push(`CREATE UNIQUE INDEX "${tableName}_${column.name}_unique" ON "${tableName}" ("${column.name}");\n`);
            return colDef;
          }).join(",\n");
          const basesql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs});\n`;
          return [basesql, ...uniques].join("");
    } catch (error) {
      console.error("Error generating table SQL:", table._.name);
      return "";
    }
}


export { DBProvider, useDB };
import { DataSource } from 'typeorm';

/**
 * Cleans all tables in the test database between test cases.
 * Uses DELETE with CASCADE-like ordering to respect FK constraints.
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;

  // Delete in reverse dependency order to respect foreign keys
  const orderedTables = entities
    .map((e) => e.tableName)
    .reverse();

  for (const table of orderedTables) {
    await dataSource.query(`DELETE FROM "${table}"`);
  }
}

/**
 * Cleans a specific table.
 */
export async function cleanTable(
  dataSource: DataSource,
  tableName: string,
): Promise<void> {
  await dataSource.query(`DELETE FROM "${tableName}"`);
}

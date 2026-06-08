import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddSavedSearches0031700000000003 implements MigrationInterface {
  name = 'AddSavedSearches0031700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saved_searches',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'search_text', type: 'varchar', length: '200', isNullable: true },
          { name: 'min_price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'max_price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'bedrooms', type: 'integer', isNullable: true },
          { name: 'property_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'alert_enabled', type: 'boolean', default: true, isNullable: false },
          { name: 'last_alerted_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('saved_searches', new TableIndex({ columnNames: ['user_id'] }));

    await queryRunner.createForeignKey(
      'saved_searches',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('saved_searches');
  }
}

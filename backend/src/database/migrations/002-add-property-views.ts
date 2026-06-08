import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddPropertyViews0021700000000001 implements MigrationInterface {
  name = 'AddPropertyViews0021700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'property_views',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'view_count', type: 'integer', isNullable: false, default: '1' },
          { name: 'last_viewed_at', type: 'timestamp', isNullable: false, default: 'now()' },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('property_views', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('property_views', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('property_views', new TableIndex({ columnNames: ['last_viewed_at'] }));

    await queryRunner.createForeignKey(
      'property_views',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'property_views',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('property_views');
  }
}

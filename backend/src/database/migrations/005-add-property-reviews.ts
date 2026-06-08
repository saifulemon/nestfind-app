import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddPropertyReviews0051700000000005 implements MigrationInterface {
  name = 'AddPropertyReviews0051700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'property_reviews',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'rating', type: 'integer', isNullable: false },
          { name: 'title', type: 'varchar', length: '200', isNullable: true },
          { name: 'comment', type: 'text', isNullable: false },
          { name: 'is_verified', type: 'boolean', default: false, isNullable: false },
          { name: 'helpful_count', type: 'integer', default: 0, isNullable: false },
          { name: 'status', type: 'varchar', length: '50', default: "'pending'", isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('property_reviews', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('property_reviews', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('property_reviews', new TableIndex({ columnNames: ['status'] }));

    await queryRunner.createForeignKey(
      'property_reviews',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'property_reviews',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('property_reviews');
  }
}

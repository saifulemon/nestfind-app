import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddNotifications0071700000000007 implements MigrationInterface {
  name = 'AddNotifications0071700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'varchar', length: '50', isNullable: false },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'message', type: 'text', isNullable: false },
          { name: 'data', type: 'text', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['is_read'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['user_id', 'is_read'] }));

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}

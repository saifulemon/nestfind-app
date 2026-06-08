import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddChatSystem0091700000000009 implements MigrationInterface {
  name = 'AddChatSystem0091700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chat_conversations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: true },
          { name: 'renter_id', type: 'uuid', isNullable: false },
          { name: 'admin_id', type: 'uuid', isNullable: false },
          { name: 'status', type: 'varchar', length: '50', default: "'active'", isNullable: false },
          { name: 'subject', type: 'varchar', length: '200', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('chat_conversations', new TableIndex({ columnNames: ['renter_id'] }));
    await queryRunner.createIndex('chat_conversations', new TableIndex({ columnNames: ['admin_id'] }));

    await queryRunner.createForeignKey(
      'chat_conversations',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_conversations',
      new TableForeignKey({
        columnNames: ['renter_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_conversations',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'chat_messages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'conversation_id', type: 'uuid', isNullable: false },
          { name: 'sender_id', type: 'uuid', isNullable: false },
          { name: 'sender_role', type: 'varchar', length: '50', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'is_read', type: 'boolean', default: false, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('chat_messages', new TableIndex({ columnNames: ['conversation_id'] }));

    await queryRunner.createForeignKey(
      'chat_messages',
      new TableForeignKey({
        columnNames: ['sender_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chat_messages');
    await queryRunner.dropTable('chat_conversations');
  }
}

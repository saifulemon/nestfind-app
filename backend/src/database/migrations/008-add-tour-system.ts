import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddTourSystem0081700000000008 implements MigrationInterface {
  name = 'AddTourSystem0081700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tour_slots',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'admin_id', type: 'uuid', isNullable: false },
          { name: 'start_time', type: 'timestamp', isNullable: false },
          { name: 'end_time', type: 'timestamp', isNullable: false },
          { name: 'tour_type', type: 'varchar', length: '50', default: "'in_person'", isNullable: false },
          { name: 'is_booked', type: 'boolean', default: false, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('tour_slots', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('tour_slots', new TableIndex({ columnNames: ['start_time'] }));
    await queryRunner.createIndex('tour_slots', new TableIndex({ columnNames: ['admin_id'] }));

    await queryRunner.createForeignKey(
      'tour_slots',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tour_slots',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'tour_bookings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'slot_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'confirmed'", isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('tour_bookings', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('tour_bookings', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('tour_bookings', new TableIndex({ columnNames: ['slot_id'] }));
    await queryRunner.createIndex('tour_bookings', new TableIndex({ columnNames: ['status'] }));

    await queryRunner.createForeignKey(
      'tour_bookings',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tour_bookings',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tour_bookings');
    await queryRunner.dropTable('tour_slots');
  }
}

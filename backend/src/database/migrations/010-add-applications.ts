import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddApplications0101700000000010 implements MigrationInterface {
  name = 'AddApplications0101700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rental_applications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'applicant_id', type: 'uuid', isNullable: false },
          { name: 'status', type: 'varchar', length: '50', default: "'submitted'", isNullable: false },
          { name: 'monthly_income', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'employment_status', type: 'varchar', length: '50', isNullable: true },
          { name: 'employer_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'employer_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'move_in_date', type: 'date', isNullable: true },
          { name: 'has_pets', type: 'boolean', default: false, isNullable: false },
          { name: 'pet_details', type: 'text', isNullable: true },
          { name: 'additional_notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('rental_applications', new TableIndex({ columnNames: ['applicant_id'] }));
    await queryRunner.createIndex('rental_applications', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('rental_applications', new TableIndex({ columnNames: ['status'] }));

    await queryRunner.createForeignKey(
      'rental_applications',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'rental_applications',
      new TableForeignKey({
        columnNames: ['applicant_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rental_applications');
  }
}

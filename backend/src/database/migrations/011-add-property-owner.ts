import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddPropertyOwner0111700000000011 implements MigrationInterface {
  name = 'AddPropertyOwner0111700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'properties',
      new TableColumn({
        name: 'owner_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({ columnNames: ['owner_id'] }),
    );

    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('properties');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('owner_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('properties', foreignKey);
    }
    await queryRunner.dropIndex('properties', 'IDX_properties_owner_id');
    await queryRunner.dropColumn('properties', 'owner_id');
  }
}

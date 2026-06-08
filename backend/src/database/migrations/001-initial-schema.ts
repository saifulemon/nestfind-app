import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema0011700000000000 implements MigrationInterface {
  name = 'InitialSchema0011700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: false, isUnique: true },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'role', type: 'enum', enum: ['renter', 'admin'], default: `'renter'`, isNullable: false },
          { name: 'status', type: 'enum', enum: ['active', 'suspended'], default: `'active'`, isNullable: false },
          { name: 'email_verified_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['role'] }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['role', 'status'] }));

    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'token', type: 'varchar', length: '500', isNullable: false, isUnique: true },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'revoked_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('refresh_tokens', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('refresh_tokens', new TableIndex({ columnNames: ['expires_at'] }));

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'token', type: 'varchar', length: '500', isNullable: false, isUnique: true },
          { name: 'expires_at', type: 'timestamp', isNullable: false },
          { name: 'used_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('password_reset_tokens', new TableIndex({ columnNames: ['user_id'] }));

    await queryRunner.createForeignKey(
      'password_reset_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'properties',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: false },
          { name: 'bedrooms', type: 'integer', isNullable: false },
          { name: 'bathrooms', type: 'integer', isNullable: false },
          { name: 'square_feet', type: 'integer', isNullable: true },
          { name: 'property_type', type: 'enum', enum: ['apartment', 'house', 'condo', 'townhouse', 'studio'], isNullable: false },
          { name: 'address_street', type: 'varchar', length: '200', isNullable: false },
          { name: 'address_city', type: 'varchar', length: '100', isNullable: false },
          { name: 'address_state', type: 'varchar', length: '100', isNullable: false },
          { name: 'address_zip_code', type: 'varchar', length: '10', isNullable: false },
          { name: 'address_latitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'address_longitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'available_from', type: 'date', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['property_type'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['price'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['bedrooms'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['bathrooms'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['address_city'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['address_state'] }));
    await queryRunner.createIndex('properties', new TableIndex({ columnNames: ['address_latitude', 'address_longitude'] }));

    await queryRunner.createTable(
      new Table({
        name: 'property_photos',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'url', type: 'varchar', length: '500', isNullable: false },
          { name: 'is_primary', type: 'boolean', default: false, isNullable: false },
          { name: 'sort_order', type: 'integer', default: 0, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('property_photos', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('property_photos', new TableIndex({ columnNames: ['property_id', 'sort_order'] }));

    await queryRunner.createForeignKey(
      'property_photos',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'amenities',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '50', isNullable: false, isUnique: true },
          { name: 'icon', type: 'varchar', length: '50', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'property_amenities',
        columns: [
          { name: 'property_id', type: 'uuid', isPrimary: true, isNullable: false },
          { name: 'amenity_id', type: 'uuid', isPrimary: true, isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('property_amenities', new TableIndex({ columnNames: ['amenity_id'] }));

    await queryRunner.createForeignKey(
      'property_amenities',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'property_amenities',
      new TableForeignKey({
        columnNames: ['amenity_id'],
        referencedTableName: 'amenities',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'favorites',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'property_id', type: 'uuid', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('favorites', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('favorites', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('favorites', new TableIndex({ columnNames: ['user_id', 'property_id'], isUnique: true }));

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'inquiries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'property_id', type: 'uuid', isNullable: true },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'message', type: 'text', isNullable: false },
          { name: 'status', type: 'enum', enum: ['new', 'read', 'responded'], default: `'new'`, isNullable: false },
          { name: 'response', type: 'text', isNullable: true },
          { name: 'responded_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('inquiries', new TableIndex({ columnNames: ['property_id'] }));
    await queryRunner.createIndex('inquiries', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('inquiries', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('inquiries', new TableIndex({ columnNames: ['status', 'created_at'] }));

    await queryRunner.createForeignKey(
      'inquiries',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'inquiries',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inquiries');
    await queryRunner.dropTable('favorites');
    await queryRunner.dropTable('property_amenities');
    await queryRunner.dropTable('amenities');
    await queryRunner.dropTable('property_photos');
    await queryRunner.dropTable('properties');
    await queryRunner.dropTable('password_reset_tokens');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('users');
  }
}

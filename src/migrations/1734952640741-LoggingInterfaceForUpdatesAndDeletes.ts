import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoggingInterfaceForUpdatesAndDeletes1734952640741
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE logs (
            id SERIAL PRIMARY KEY,
            action VARCHAR(10) NOT NULL,
            table_name VARCHAR(255) NOT NULL,
            old_data JSONB,
            new_data JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE logs;
    `);
  }
}

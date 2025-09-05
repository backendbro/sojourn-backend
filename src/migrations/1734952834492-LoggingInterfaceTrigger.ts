import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoggingInterfaceTrigger1734952834492
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION log_changes_with_new()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (TG_OP = 'UPDATE') THEN
                    INSERT INTO logs (action, table_name, old_data, new_data, created_at)
                    VALUES ('UPDATE', TG_TABLE_NAME, row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP);
                ELSIF (TG_OP = 'DELETE') THEN
                    INSERT INTO logs (action, table_name, old_data, new_data, created_at)
                    VALUES ('DELETE', TG_TABLE_NAME, row_to_json(OLD), NULL, CURRENT_TIMESTAMP);
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS log_changes_with_new;
    `);
  }
}

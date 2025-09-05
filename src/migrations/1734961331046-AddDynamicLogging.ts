import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDynamicLogging1734961331046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the log table if it does not exist
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id SERIAL PRIMARY KEY,
          action VARCHAR(50),
          table_name VARCHAR(100),
          old_data JSONB,
          new_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    // 2. Create the log trigger function
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION log_trigger_function()
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

    // 3. Create triggers for each table in the public schema
    const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
      `);

    for (const table of tables) {
      const tableName = table.table_name;
      await queryRunner.query(`
          CREATE TRIGGER ${tableName}_trigger
          AFTER UPDATE OR DELETE ON public.${tableName}
          FOR EACH ROW
          EXECUTE FUNCTION log_trigger_function();
        `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the triggers for all tables
    const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
      `);

    for (const table of tables) {
      const tableName = table.table_name;
      await queryRunner.query(`
          DROP TRIGGER IF EXISTS ${tableName}_trigger ON public.${tableName};
        `);
    }

    // Drop the log function and table
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS log_trigger_function;
      `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS logs;
      `);
  }
}

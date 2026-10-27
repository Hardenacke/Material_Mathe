export function migrate(ctx, schema) {
  ctx.storage.transactionSync(() => {
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)');
    if (![...ctx.storage.sql.exec('SELECT version FROM schema_migrations WHERE version=1')].length) {
      ctx.storage.sql.exec(schema);
      ctx.storage.sql.exec('INSERT INTO schema_migrations VALUES (1)');
    }
  });
}
export const one = cursor => [...cursor][0];
export const getMeta = (sql, key) => one(sql.exec('SELECT value FROM meta WHERE key=?', key))?.value;
export const setMeta = (sql, key, value) => sql.exec('INSERT INTO meta(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, String(value));

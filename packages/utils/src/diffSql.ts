import type { DiffResult, DiffBody } from './diff';

export const diffSql = <B extends DiffBody>(tableName: string, diff: DiffResult<B>): string => {
  const sqlStatements: string[] = [];

  if (diff.added.length > 0) {
    const columns = Object.keys(diff.added[0]);
    const values = diff.added.map(record => {
      const valueList = columns.map(col => {
        const value = record[col as keyof B];
        return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
      });
      return `(${valueList.join(', ')})`;
    });

    const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values.join(', ')};`;
    sqlStatements.push(insertSql);
  }

  if (diff.modified.length > 0) {
    diff.modified.forEach(record => {
      const setClause = Object.keys(record)
        .filter(key => key !== 'id')
        .map(key => {
          const value = record[key as keyof B];
          const escapedValue = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
          return `${key} = ${escapedValue}`;
        })
        .join(', ');

      const updateSql = `UPDATE ${tableName} SET ${setClause} WHERE id = ${record.id};`;
      sqlStatements.push(updateSql);
    });
  }

  if (diff.deleted.length > 0) {
    const deleteSql = `DELETE FROM ${tableName} WHERE id IN (${diff.deleted.join(', ')});`;
    sqlStatements.push(deleteSql);
  }

  return sqlStatements.join('\n');
};

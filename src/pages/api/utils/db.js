const buildInsert = (table, data) => {
  const keys = Object.keys(data);

  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(data);

  return {
    text: `
      INSERT INTO ${table}
      (${columns})
      VALUES (${placeholders})
    `,
    values,
  };
}

export { buildInsert };
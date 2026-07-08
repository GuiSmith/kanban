function databaseDateToPrisma(date) {
  if (!date) return null;

  return new Date(`${date}T00:00:00.000Z`);
}

export default databaseDateToPrisma;
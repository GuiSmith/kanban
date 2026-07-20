const getQuadroRoom = (idEspaco) => {
  const normalizedId = Number(idEspaco);

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    return null;
  }

  return `quadro:espaco:${normalizedId}`;
};

export default getQuadroRoom;

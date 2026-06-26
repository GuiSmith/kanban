const adjectives = [
  "swift",
  "silent",
  "brave",
  "lucky",
  "cosmic",
];

const nouns = [
  "wolf",
  "fox",
  "otter",
  "falcon",
  "panda",
];

const MAX_LENGTH = 15;

const usernameGenerator = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = String(Math.floor(Math.random() * 10000));

  // 2 underscores
  const fixedLength = number.length + 2;
  const available = MAX_LENGTH - fixedLength;

  const adjectiveLength = Math.floor(available / 2);
  const nounLength = available - adjectiveLength;

  return `${adjective.slice(0, adjectiveLength)}_${noun.slice(0, nounLength)}_${number}`;
};

export default usernameGenerator;
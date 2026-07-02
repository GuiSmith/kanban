export default function capitalizeFirstLetter(phrase) {
  if(!phrase) return '';
  
  const words = phrase.toLowerCase().split(' ')
  
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

  return capitalizedWords.join(' ');
}

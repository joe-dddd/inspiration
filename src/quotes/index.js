import yimingQuotes from "./yiming.json";
import wangxingQuotes from "./wangxing.json";
import bezos from "./bezos.json";
import dontbesilentQuotes from "./dontbesilent.json";

const quotesList = [
  {
    quotes: yimingQuotes,
    author: "张一鸣",
  },
  {
    quotes: wangxingQuotes,
    author: "王兴",
  },
  {
    quotes: bezos,
    author: "贝佐斯",
  },
  {
    quotes: dontbesilentQuotes,
    author: "dontbesilent",
  },
];
export function randomQuote() {
  const authorIndex = randomInt(quotesList.length);
  const q = quotesList[authorIndex];
  const quoteIndex = randomInt(q.quotes.length);
  return {
    text: q.quotes[quoteIndex],
    author: q.author
  };
}
function randomInt(max) {
  return Math.floor(Math.random() * max);
}
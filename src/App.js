import { DateTime } from 'luxon';
import './App.css';
import { useState } from 'react';
import { randomQuote } from './quotes/index';
import html2canvas from 'html2canvas';

function App() {
  const [state, setState] = useState({
    time: DateTime.local(),
    quote: randomQuote(),
  });
  const [showNotification, setShowNotification] = useState(false);
  function getBGStyle() {
    return {
      backgroundSize: 'cover',
      height: '100vh'
    }
  }
  function onQuoteClick() {
    setState({...state, quote: randomQuote()})
  }
  function quoteClassName() {
    let cn = "quote-text"
    const lineCount = state.quote.text.split("\n").length;
    if (state.quote.text.length >= 500 || lineCount >= 8) {
      cn = `${cn} quote-text-xs`
    } else if (state.quote.text.length >= 200 || lineCount >= 4) {
      cn = `${cn} quote-text-small`
    }
    return cn
  }

  async function handleScreenshot() {
    try {
      const element = document.getElementById('cover');
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null
      });

      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      });
    } catch (err) {
      console.error('截图失败:', err);
    }
  }

  return (
    <div id="cover" style={getBGStyle()}>
      <div className="bg-wrapper">
        <div className="centered">
          <p className={quoteClassName()} onClick={onQuoteClick}>
            {state.quote.text}
          </p>
          <p className="quote-author">by {state.quote.author}</p>
          <div className="screenshot-btn" onClick={handleScreenshot}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
        <div className="bottom-right">
        <div className="time-text">
            <span id="time">{state.time.toFormat("h':'mm")}</span>
            <span id="ampm">{state.time.toFormat('a')}</span>
          </div>
        </div>
        {showNotification && (
          <div className="notification">
            截图完成，已保存到剪贴板
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

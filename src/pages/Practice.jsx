import React, { useState, useEffect, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { Clock, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const TIME_LIMITS = [15, 30, 60, 120];

export default function Practice() {
  const { currentUser } = useAuth();
  const [timeMode, setTimeMode] = useState(15);
  const engine = useTypingEngine(timeMode);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = () => {
      if (!engine.isTestCompleted && inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine.isTestCompleted]);

  // Save to DB on completion
  useEffect(() => {
    if (engine.isTestCompleted && currentUser) {
      const saveResult = async () => {
        try {
          await addDoc(collection(db, "results"), {
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            wpm: engine.stats.wpm,
            acc: engine.stats.accuracy,
            raw: engine.stats.raw,
            timeMode: timeMode,
            timestamp: serverTimestamp()
          });
        } catch (e) {
          console.error("AI Error:", e);
        }
      };
      saveResult();
    }
  }, [engine.isTestCompleted, currentUser, timeMode]);

  const renderWords = () => {
    return engine.words.slice(Math.max(0, engine.currentWordIndex - 20), engine.currentWordIndex + 30).map((wordObj, i) => {
      const globalIndex = Math.max(0, engine.currentWordIndex - 20) + i;
      const isActive = globalIndex === engine.currentWordIndex;
      
      return (
        <div key={globalIndex} className={`inline-block mx-[0.25em] my-[0.25em] relative`}>
          {wordObj.text.split('').map((char, j) => {
            let className = "text-sub transition-colors";
            
            if (isActive) {
              if (j < engine.currentInput.length) {
                className = engine.currentInput[j] === char ? "text-main" : "text-error";
              }
            } else if (wordObj.status === 'correct') {
              className = "text-main";
            } else if (wordObj.status === 'incorrect') {
              className = "text-error";
            }
            
            return (
              <span key={j} className={className}>
                {char}
              </span>
            );
          })}
          {isActive && engine.currentInput.length > wordObj.text.length && (
            <span className="text-errorExtra">
              {engine.currentInput.slice(wordObj.text.length)}
            </span>
          )}
          {isActive && (
            <div 
              className="absolute w-[2px] bg-primary caret-blink transition-all duration-100 h-6"
              style={{
                left: `${(Math.min(engine.currentInput.length, wordObj.text.length) + Math.max(0, engine.currentInput.length - wordObj.text.length)) * 0.6}em`,
                top: '0'
              }}
            />
          )}
        </div>
      );
    });
  };

  if (engine.isTestCompleted) {
    return (
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full mt-10">
        <div className="grid grid-cols-3 w-full gap-8 mb-12">
          <div className="flex flex-col">
            <span className="text-sub text-2xl">wpm</span>
            <span className="text-primary text-6xl leading-none font-bold">{engine.stats.wpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sub text-2xl">acc</span>
            <span className="text-primary text-6xl leading-none font-bold">{engine.stats.accuracy}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sub text-2xl">raw</span>
            <span className="text-primary text-6xl leading-none font-bold">{engine.stats.raw}</span>
          </div>
        </div>

        <div className="w-full h-64 mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engine.history}>
              <XAxis dataKey="time" stroke="#646669" />
              <YAxis stroke="#646669" />
              <Tooltip contentStyle={{ backgroundColor: '#2c2e31', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="wpm" stroke="#61afef" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="raw" stroke="#646669" strokeWidth={2} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button 
          onClick={() => engine.resetTest(timeMode)}
          className="text-sub hover:text-main flex items-center justify-center p-4 hover:bg-subAlt transition-colors rounded-xl"
        >
          <RotateCcw size={28} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full mt-10" onClick={() => inputRef.current?.focus()}>
      <div className="flex justify-center mb-10">
        <div className="bg-subAlt flex items-center rounded-lg p-2 gap-4">
          <div className="flex items-center gap-2 text-sub px-3 border-r-2 border-bg font-bold">
            <Clock size={18} /> time
          </div>
          <div className="flex gap-2">
            {TIME_LIMITS.map(t => (
              <button 
                key={t}
                className={`px-3 py-1 rounded transition-colors font-bold ${timeMode === t ? 'text-primary' : 'text-sub hover:text-main'}`}
                onClick={() => { setTimeMode(t); engine.resetTest(t); }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-primary text-3xl mb-4 ml-2 font-bold">{engine.timeLeft}</div>

      <div className="relative text-3xl leading-relaxed h-[180px] overflow-hidden select-none">
        <input 
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 -z-10 focus:outline-none"
          value={engine.currentInput}
          onChange={(e) => engine.handleInput(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <div className="flex flex-wrap content-start transition-all">
          {renderWords()}
        </div>
      </div>
      
      <div className="flex justify-center mt-12">
        <button 
          onClick={() => engine.resetTest(timeMode)}
          className="text-sub hover:text-main flex items-center justify-center p-3 hover:bg-subAlt transition-colors rounded-lg"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}

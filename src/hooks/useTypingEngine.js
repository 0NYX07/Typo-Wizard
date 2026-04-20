import { useState, useEffect, useCallback } from 'react';

const wordsList = "the be of and a to in he have it that for they i with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold co govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line".split(" ");

const generateWords = (count) => {
  return Array(count).fill('').map(() => {
    const text = wordsList[Math.floor(Math.random() * wordsList.length)];
    return { text, typed: '', status: 'pending' };
  });
};

export function useTypingEngine(timeLimit = 15) {
  const [words, setWords] = useState(() => generateWords(100));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  
  const [stats, setStats] = useState({ correctChars: 0, incorrectChars: 0, totalChars: 0 });
  const [history, setHistory] = useState([]);

  const resetTest = useCallback((newTimeLimit = timeLimit) => {
    setWords(generateWords(100));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTimeLeft(newTimeLimit);
    setIsTestActive(false);
    setIsTestCompleted(false);
    setStats({ correctChars: 0, incorrectChars: 0, totalChars: 0 });
    setHistory([]);
  }, [timeLimit]);

  useEffect(() => {
    resetTest(timeLimit);
  }, [timeLimit, resetTest]);

  useEffect(() => {
    let interval;
    if (isTestActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const timeElapsed = timeLimit - newTime;
          
          if (timeElapsed > 0 && timeElapsed % 1 === 0) {
            setHistory(h => [
              ...h, 
              { 
                time: timeElapsed, 
                wpm: Math.round((stats.correctChars / 5) / (timeElapsed / 60)) || 0,
                raw: Math.round(((stats.correctChars + stats.incorrectChars) / 5) / (timeElapsed / 60)) || 0
              }
            ]);
          }
          
          if (newTime <= 0) {
            setIsTestActive(false);
            setIsTestCompleted(true);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, timeLeft, timeLimit, stats.correctChars, stats.incorrectChars]);

  const handleInput = useCallback((value) => {
    if (isTestCompleted) return;
    if (!isTestActive && value.length > 0) {
      setIsTestActive(true);
    }

    const currentWord = words[currentWordIndex];

    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const isCorrect = typedWord === currentWord.text;
      
      let tempCorrect = 0;
      let tempIncorrect = 0;
      for(let i = 0; i < Math.max(typedWord.length, currentWord.text.length); i++) {
         if (typedWord[i] === currentWord.text[i]) tempCorrect++;
         else tempIncorrect++;
      }

      setStats(prev => ({
        ...prev,
        correctChars: prev.correctChars + tempCorrect,
        incorrectChars: prev.incorrectChars + tempIncorrect,
        totalChars: prev.totalChars + typedWord.length + 1
      }));

      setWords(prev => {
        const newWords = [...prev];
        newWords[currentWordIndex] = {
          ...currentWord,
          typed: typedWord,
          status: isCorrect ? 'correct' : 'incorrect'
        };
        return newWords;
      });

      setCurrentWordIndex(prev => prev + 1);
      setCurrentInput('');
      
      if (currentWordIndex > 80) {
        setWords(prev => [...prev, ...generateWords(50)]);
      }
    } else {
      setCurrentInput(value);
      setWords(prev => {
        const newWords = [...prev];
        newWords[currentWordIndex] = {
          ...currentWord,
          typed: value,
          status: 'active'
        };
        return newWords;
      });
    }
  }, [words, currentWordIndex, isTestActive, isTestCompleted]);

  const finalWpm = Math.round((stats.correctChars / 5) / (timeLimit / 60)) || 0;
  const accuracy = stats.totalChars > 0 ? Math.round((stats.correctChars / stats.totalChars) * 100) : 0;
  const finalRaw = Math.round(((stats.correctChars + stats.incorrectChars) / 5) / (timeLimit / 60)) || 0;

  return {
    words,
    currentWordIndex,
    currentInput,
    timeLeft,
    isTestActive,
    isTestCompleted,
    history,
    stats: { wpm: finalWpm, accuracy, raw: finalRaw },
    handleInput,
    resetTest
  };
}

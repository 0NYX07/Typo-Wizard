import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Trophy, Activity, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ avgWpm: 0, topWpm: 0, avgAcc: 0, totalTests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "results"),
          where("uid", "==", currentUser.uid),
          limit(100)
        );
        const querySnapshot = await getDocs(q);
        let rawData = [];
        let totalWpm = 0, topWpm = 0, totalAcc = 0;
        
        querySnapshot.forEach((doc) => {
          const res = doc.data();
          rawData.push({
            timeMs: res.timestamp ? res.timestamp.toMillis() : Date.now(),
            wpm: res.wpm,
            acc: res.acc,
            raw: res.raw
          });
          totalWpm += res.wpm;
          totalAcc += res.acc;
          if (res.wpm > topWpm) topWpm = res.wpm;
        });

        rawData.sort((a, b) => a.timeMs - b.timeMs);
        const data = rawData.map((d, idx) => ({...d, testNumber: idx + 1}));

        setHistory(data);
        if (data.length > 0) {
          setStats({
            avgWpm: Math.round(totalWpm / data.length),
            topWpm,
            avgAcc: Math.round(totalAcc / data.length),
            totalTests: data.length
          });
        }
      } catch (e) {
        console.error("Dashboard Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  if (loading) return <div className="text-sub text-center mt-20 flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>Synthesizing Analytics...</div>;

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full mt-4">
      <h1 className="text-3xl text-main font-bold mb-8 flex items-center gap-3">
        <Activity className="text-primary" size={32}/> 
        Training Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-subAlt/30 p-6 rounded-xl border border-subAlt transition-all hover:border-primary/50">
          <div className="text-sub flex items-center gap-2 mb-2"><Trophy size={18}/> Top WPM</div>
          <div className="text-4xl text-primary font-bold">{stats.topWpm}</div>
        </div>
        <div className="bg-subAlt/30 p-6 rounded-xl border border-subAlt transition-all hover:border-primary/50">
          <div className="text-sub flex items-center gap-2 mb-2"><Activity size={18}/> Avg WPM</div>
          <div className="text-4xl text-main font-bold">{stats.avgWpm}</div>
        </div>
        <div className="bg-subAlt/30 p-6 rounded-xl border border-subAlt transition-all hover:border-primary/50">
          <div className="text-sub flex items-center gap-2 mb-2"><Target size={18}/> Avg Accuracy</div>
          <div className="text-4xl text-main font-bold">{stats.avgAcc}%</div>
        </div>
        <div className="bg-subAlt/30 p-6 rounded-xl border border-subAlt transition-all hover:border-primary/50">
          <div className="text-sub flex items-center gap-2 mb-2"><Zap size={18}/> Total Sessions</div>
          <div className="text-4xl text-main font-bold">{stats.totalTests}</div>
        </div>
      </div>

      <div className="bg-subAlt/20 p-8 rounded-xl border border-subAlt/50 mb-8">
        <h2 className="text-xl text-sub mb-6">WPM Progression History</h2>
        {history.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2e31" vertical={false} />
                <XAxis dataKey="testNumber" stroke="#646669" />
                <YAxis stroke="#646669" />
                <Tooltip contentStyle={{ backgroundColor: '#2c2e31', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="wpm" name="WPM" stroke="#61afef" strokeWidth={3} dot={{ fill: '#323437', stroke: '#61afef', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sub text-center py-20 flex flex-col items-center gap-4">
            <Target size={48} className="opacity-20" />
            No training data found. Complete a practice session to see analytics!
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/doctor/DoctorStatistics.jsx
import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useAppContext } from "../../context/AppContext";
import { Activity, TrendingUp, Users, AlertTriangle } from "lucide-react";

const DoctorStatistics = () => {
  const { patients, user } = useAppContext();
  
  // Filter for *this* doctor's patients
  const myPatients = patients.filter(p => p.doctorAssignedId === user.id);

  // --- 1. CALCULATE REAL-TIME METRICS ---
  const stats = useMemo(() => {
    let onTime = 0, late = 0, missed = 0;
    myPatients.forEach(p => {
      p.medicines.forEach(m => {
        m.schedule.forEach(s => {
          if (s.status === "on_time") onTime++;
          if (s.status === "late") late++;
          if (s.status === "missed") missed++;
        });
      });
    });
    return { onTime, late, missed, total: onTime + late + missed };
  }, [myPatients]);

  // --- 2. PREPARE CHART DATA ---
  
  // PIE CHART: Adherence Distribution
  const pieData = [
    { name: 'On Time', value: stats.onTime, color: '#10b981' }, // Green
    { name: 'Late', value: stats.late, color: '#f59e0b' },      // Orange
    { name: 'Missed', value: stats.missed, color: '#ef4444' },  // Red
  ];

  // BAR CHART: Patient Compliance by Age Group (Derived)
  const ageBuckets = [
    { name: '0-18', min: 0, max: 18, onTime: 0, total: 0 },
    { name: '19-40', min: 19, max: 40, onTime: 0, total: 0 },
    { name: '41-60', min: 41, max: 60, onTime: 0, total: 0 },
    { name: '60+', min: 61, max: 200, onTime: 0, total: 0 },
  ];

  myPatients.forEach(p => {
    const age = Number(p.age) || 0;
    const bucket = ageBuckets.find(b => age >= b.min && age <= b.max) || ageBuckets[0];
    p.medicines.forEach(m => {
      m.schedule.forEach(s => {
        if (["on_time", "late", "missed"].includes(s.status)) {
          bucket.total += 1;
          if (s.status === "on_time") bucket.onTime += 1;
        }
      });
    });
  });

  const ageData = ageBuckets.map(b => {
    const compliant = b.total ? Math.round((b.onTime / b.total) * 100) : 0;
    return { name: b.name, compliant, risk: 100 - compliant };
  });

  // AREA CHART: Weekly Trend (Derived from prescriptions)
  const trendMap = new Map();
  myPatients.forEach(p => {
    p.medicines.forEach(m => {
      if (!m.prescribedAt) return;
      const dateKey = new Date(m.prescribedAt).toISOString().slice(0, 10);
      let entry = trendMap.get(dateKey);
      if (!entry) entry = { dateKey, onTime: 0, total: 0 };

      m.schedule.forEach(s => {
        if (["on_time", "late", "missed"].includes(s.status)) {
          entry.total += 1;
          if (s.status === "on_time") entry.onTime += 1;
        }
      });

      trendMap.set(dateKey, entry);
    });
  });

  const trendData = Array.from(trendMap.values())
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-7)
    .map(entry => ({
      day: entry.dateKey,
      adherence: entry.total ? Math.round((entry.onTime / entry.total) * 100) : 0,
    }));

  const weeklyGrowth = (() => {
    if (trendData.length < 2) return 0;
    const first = trendData[0]?.adherence ?? 0;
    const last = trendData[trendData.length - 1]?.adherence ?? 0;
    return last - first;
  })();

  const weeklyGrowthLabel = `${weeklyGrowth >= 0 ? "+" : ""}${weeklyGrowth}%`;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-slate-800">Clinical Analytics</h1>
           <p className="text-slate-500">Real-time insights into patient adherence.</p>
        </div>
        <div className="text-right">
           <p className="text-xs font-bold text-slate-400 uppercase">My Patient Load</p>
           <p className="text-2xl font-black text-teal-600">{myPatients.length} Patients</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-green-600 font-bold text-sm">
               <Activity size={16}/> On Time Rate
            </div>
            <p className="text-3xl font-black text-slate-800">
               {stats.total ? Math.round((stats.onTime / stats.total) * 100) : 0}%
            </p>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-sm">
               <AlertTriangle size={16}/> Critical Misses
            </div>
            <p className="text-3xl font-black text-slate-800">{stats.missed}</p>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold text-sm">
               <TrendingUp size={16}/> Weekly Growth
            </div>
            <p className="text-3xl font-black text-slate-800">{weeklyGrowthLabel}</p>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-purple-500 font-bold text-sm">
               <Users size={16}/> Active Rx
            </div>
            <p className="text-3xl font-black text-slate-800">
              {myPatients.reduce((acc, p) => acc + p.medicines.length, 0)}
            </p>
         </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Adherence Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 mb-6">Medication Adherence Distribution</h3>
           <div className="h-64 flex items-center justify-center">
             {stats.total === 0 ? (
               <p className="text-sm font-semibold text-slate-400">No adherence data yet.</p>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             )}
           </div>
           <div className="flex justify-center gap-6 mt-4">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                   <span className="text-xs font-bold text-slate-500">{d.name}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 mb-6">Weekly Adherence Trend (%)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                 <defs>
                   <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} />
                 <YAxis hide domain={[0, 100]} />
                 <Tooltip />
                 <Area type="monotone" dataKey="adherence" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorAdh)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Demographics */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <h3 className="font-bold text-slate-800 mb-6">Compliance Risk by Age Group</h3>
         <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={ageData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={50} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="compliant" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default DoctorStatistics;

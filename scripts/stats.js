export function calcTotals(records){
const total = records.reduce((s,r)=>s + Number(r.amount||0), 0);
const count = records.length;
const byCat = records.reduce((acc,r)=>{ acc[r.category] = (acc[r.category]||0)+1; return acc;}, {});
const topCategory = Object.keys(byCat).sort((a,b)=>byCat[b]-byCat[a])[0] || null;
return {total,count,topCategory,byCat};
}


export function last7DaysTrend(records){
const days = Array.from({length:7}, (_,i)=>{
const d = new Date(); d.setDate(d.getDate()- (6-i));
const key = d.toISOString().slice(0,10);
const sum = records.filter(r=>r.date===key).reduce((s,r)=>s+Number(r.amount||0),0);
return {date:key,sum};
});
return days;
}
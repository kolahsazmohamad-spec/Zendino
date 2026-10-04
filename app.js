const $=s=>document.querySelector(s),H=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fa=n=>Number(n).toLocaleString('fa-IR');
const iso=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmt=k=>k?new Date(k+'T12:00').toLocaleDateString('fa-IR',{day:'numeric',month:'long'}):'';
const back=n=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)};
let D={},V='dash',T=iso(),fresh=null;DB.stores.forEach(s=>D[s]=[]);
const PR=['','خیلی کم','کم','معمولی','زیاد','بحرانی'],HT={daily:'روزانه',count:'تعداد',minutes:'دقیقه'};
const CARDS={next:'قدم بعدی',tasks:'کارهای امروز',goals:'اهداف',habits:'عادت‌ها',energy:'انرژی'};
const Q=['بیشتر از ۶ ساعت خوابیدی؟','خوابت تقریباً پیوسته بود؟','قبل از ۱۱ صبح بیدار شدی؟','موقع بیدار شدن سنگینی شدید نداشتی؟','حداقل یک‌بار از خانه خارج شدی؟','پیاده‌روی یا کار فیزیکی قابل توجه داشتی؟','ورزش کردی (حتی کوتاه)؟','حداقل یک کار مهم را کامل کردی؟','بیشتر روز تمرکز قابل قبول داشتی؟'];
const cfg=()=>{const c=D.settings.find(s=>s.id==='cfg')||{id:'cfg',name:'',cards:[],next:1,motion:1,theme:'fx'};Object.keys(CARDS).forEach(k=>{if(!c.cards.find(x=>x.k===k))c.cards.push({k,on:1})});return c};
async function load(){for(const s in D)D[s]=await DB.all(s)}
async function save(s,v){await DB.put(s,v);await load();render()}
// پیشرفت: کار → پروژه → هدف
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const tp=t=>t.status==='done'?1:(t.subs&&t.subs.length?t.subs.filter(s=>s.d).length/t.subs.length:0);
const pp=p=>avg(D.tasks.filter(t=>t.projectId===p.id).map(tp));
const gp=g=>avg([...D.projects.filter(p=>p.goalId===g.id).map(pp),...D.tasks.filter(t=>t.goalId===g.id&&!t.projectId).map(tp)]);
const bar=v=>`<div class="bar" role="progressbar" aria-valuenow="${Math.round(v*100)}"><i style="width:${v*100}%"></i></div>`;
const open=t=>t.status!=='done';
// کارها
async function addTask(){const t=$('#tt').value.trim();if(!t)return;const l=$('#tl').value.split(':'),o={title:t,pri:+$('#tp').value,status:'todo',due:$('#td').value||'',subs:[]};
 if(l[0]==='p'){o.projectId=l[1];o.goalId=(D.projects.find(p=>p.id===l[1])||{}).goalId}else if(l[0]==='g')o.goalId=l[1];await save('tasks',o)}
async function tog(id){const t=D.tasks.find(x=>x.id===id);t.status=t.status==='done'?'todo':'done';t.doneAt=t.status==='done'?Date.now():null;fresh=t.status==='done'?id:null;await save('tasks',t)}
async function start(id){const t=D.tasks.find(x=>x.id===id);t.status='doing';await save('tasks',t)}
async function addSub(id){const s=prompt('عنوان زیرکار:');if(!s)return;const t=D.tasks.find(x=>x.id===id);t.subs.push({t:s,d:0});await save('tasks',t)}
async function togSub(id,i){const t=D.tasks.find(x=>x.id===id);t.subs[i].d^=1;await save('tasks',t)}
async function delTask(id){if(!confirm('این کار حذف شود؟'))return;await DB.del('tasks',id);await load();render()}
const row=t=>`<div class="it"><button class="chk ${t.status==='done'?'on':''} ${fresh===t.id?'fresh':''}" aria-label="تکمیل: ${H(t.title)}" onclick="tog('${t.id}')">${t.status==='done'?'✓':''}</button><div class="g"><div class="${t.status==='done'?'dn':''}">${H(t.title)}</div><div class="mut">${PR[t.pri]}${t.due?' · '+fmt(t.due):''}${t.status==='doing'?' · در حال انجام':''}</div>${(t.subs||[]).map((s,i)=>`<label class="mut" style="display:block"><input type="checkbox" style="width:auto;min-height:0" ${s.d?'checked':''} onchange="togSub('${t.id}',${i})"> ${H(s.t)}</label>`).join('')}</div><button class="ic" aria-label="افزودن زیرکار" onclick="addSub('${t.id}')">＋</button><button class="ic" aria-label="حذف" onclick="delTask('${t.id}')">🗑</button></div>`;
const list=(h,a)=>a.length?`<div class="card"><h2>${h} (${fa(a.length)})</h2>${a.map(row).join('')}</div>`:'';
function tasks(){const od=D.tasks.filter(t=>open(t)&&t.due&&t.due<T),td=D.tasks.filter(t=>t.due===T),lt=D.tasks.filter(t=>open(t)&&(!t.due||t.due>T));
 const opts=D.goals.map(g=>`<option value="g:${g.id}">هدف: ${H(g.title)}</option>`).join('')+D.projects.map(p=>`<option value="p:${p.id}">پروژه: ${H(p.title)}</option>`).join('');
 return `<div class="card"><h2>کار جدید</h2><input id="tt" placeholder="عنوان" aria-label="عنوان کار"><div class="row wrap" style="margin-top:8px"><select id="tp" aria-label="اولویت" style="flex:1">${[3,4,5,2,1].map(n=>`<option value="${n}">${PR[n]}</option>`).join('')}</select><input id="td" type="date" value="${T}" aria-label="مهلت" style="flex:1"></div><select id="tl" style="margin-top:8px" aria-label="ارتباط"><option value="">مستقل</option>${opts}</select><button class="btn" style="margin-top:8px" onclick="addTask()">افزودن</button></div>`
 +list('امروز',td)+list('عقب‌افتاده (خودکار جابه‌جا نمی‌شود)',od.filter(t=>t.due!==T))+list('بعداً / بدون زمان',lt.filter(t=>t.due!==T))
 +(D.tasks.length?'':'<div class="empty">هنوز کاری نداری. اولین کار را بساز.</div>')}
const nxt=()=>D.tasks.filter(t=>open(t)&&t.due&&t.due<=T).sort((a,b)=>b.pri-a.pri||a.due.localeCompare(b.due))[0];
// اهداف و پروژه‌ها
async function addGoal(){const t=$('#gt').value.trim();if(t)await save('goals',{title:t,due:$('#gd').value||''})}
async function addProj(){const t=$('#pt').value.trim();if(t)await save('projects',{title:t,goalId:$('#pg').value||null})}
async function delGoal(id){const p=D.projects.filter(x=>x.goalId===id).length,t=D.tasks.filter(x=>x.goalId===id).length;
 if(!confirm(`این هدف ${fa(p)} پروژه و ${fa(t)} کار دارد. فقط از هدف جدا می‌شوند و حذف نمی‌شوند. ادامه؟`)||!confirm('تأیید دوم: هدف برای همیشه حذف شود؟'))return;
 for(const x of D.projects.filter(x=>x.goalId===id)){x.goalId=null;await DB.put('projects',x)}for(const x of D.tasks.filter(x=>x.goalId===id)){x.goalId=null;await DB.put('tasks',x)}await DB.del('goals',id);await load();render()}
async function delProj(id){const t=D.tasks.filter(x=>x.projectId===id).length;if(!confirm(`این پروژه ${fa(t)} کار دارد؛ کارها حذف نمی‌شوند و مستقل می‌شوند. ادامه؟`)||!confirm('تأیید دوم: پروژه حذف شود؟'))return;
 for(const x of D.tasks.filter(x=>x.projectId===id)){x.projectId=null;await DB.put('tasks',x)}await DB.del('projects',id);await load();render()}
function goals(){return `<div class="card"><h2>هدف جدید</h2><div class="row"><input id="gt" placeholder="عنوان هدف" aria-label="هدف"><input id="gd" type="date" aria-label="تاریخ هدف" style="max-width:150px"></div><button class="btn" style="margin-top:8px" onclick="addGoal()">افزودن هدف</button></div>`
 +(D.goals.length?'':'<div class="empty">هنوز هدفی نداری. اولین هدف خودت را بساز.</div>')
 +D.goals.map(g=>`<div class="card"><div class="row"><b class="g">${H(g.title)}</b><span class="tag">${fa(Math.round(gp(g)*100))}٪</span><button class="ic" aria-label="حذف هدف" onclick="delGoal('${g.id}')">🗑</button></div>${g.due?`<div class="mut">تا ${fmt(g.due)}</div>`:''}${bar(gp(g))}${D.projects.filter(p=>p.goalId===g.id).map(p=>`<div class="row" style="margin-top:8px"><span class="g">${H(p.title)}</span><span class="mut">${fa(Math.round(pp(p)*100))}٪</span><button class="ic" aria-label="حذف پروژه" onclick="delProj('${p.id}')">🗑</button></div>${bar(pp(p))}`).join('')}</div>`).join('')
 +`<div class="card"><h2>پروژه جدید</h2><div class="row"><input id="pt" placeholder="عنوان پروژه" aria-label="پروژه"><select id="pg" aria-label="هدف مرتبط"><option value="">بدون هدف</option>${D.goals.map(g=>`<option value="${g.id}">${H(g.title)}</option>`).join('')}</select></div><button class="btn" style="margin-top:8px" onclick="addProj()">افزودن پروژه</button></div>`}
// عادت‌ها
const lg=(h,k)=>D.habitLogs.find(l=>l.id===h.id+'_'+k);
let hdone=(h,k)=>{const l=lg(h,k);return !!l&&(h.type==='daily'||l.value>=(h.target||1))};
function hstat(h){let a=0,s=0,m=0;for(let i=0;i<14;i++)if(hdone(h,back(i)))a++;for(let i=0;i<365;i++){if(hdone(h,back(i))){s++;m=0}else if(i>0){m++;if(m>1)break}}return{a,s}}
async function addHab(){const t=$('#ht').value.trim();if(t)await save('habits',{title:t,type:$('#hy').value,target:+$('#hg').value||1})}
async function logH(id,v){const old=D.habitLogs.find(l=>l.id===id+'_'+T);if(!v){if(old)await DB.del('habitLogs',old.id)}else await DB.put('habitLogs',{id:id+'_'+T,habitId:id,date:T,value:v});await load();render()}
async function delHab(id){if(!confirm('عادت و تمام سابقه‌اش حذف شود؟')||!confirm('تأیید دوم: حذف قطعی؟'))return;for(const l of D.habitLogs.filter(l=>l.habitId===id))await DB.del('habitLogs',l.id);await DB.del('habits',id);await load();render()}
const habRow=h=>{const s=hstat(h),l=lg(h,T),d=hdone(h,T);return `<div class="it"><div class="g"><div>${H(h.title)} ${d?'✓':''}</div><div class="mut">${fa(s.a)} از ۱۴ روز اخیر · تداوم: ${fa(s.s)} روز (با تحمل یک وقفه)</div></div>${h.type==='daily'?`<button class="chk ${d?'on':''}" aria-label="ثبت ${H(h.title)}" onclick="logH('${h.id}',${d?0:1})">${d?'✓':''}</button>`:`<input type="number" min="0" style="width:84px" aria-label="مقدار" value="${l?l.value:''}" placeholder="/${fa(h.target)}" onchange="logH('${h.id}',+this.value)">`}<button class="ic" aria-label="حذف" onclick="delHab('${h.id}')">🗑</button></div>`};
function hab(){return `<div class="card"><h2>عادت جدید</h2><input id="ht" placeholder="نام عادت" aria-label="نام عادت"><div class="row" style="margin-top:8px"><select id="hy" aria-label="نوع">${Object.entries(HT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input id="hg" type="number" min="1" placeholder="هدف عددی" aria-label="هدف عددی"></div><button class="btn" style="margin-top:8px" onclick="addHab()">افزودن</button></div><div class="card"><h2>عادت‌های این روز</h2>${D.habits.map(habRow).join('')||'<div class="empty">هنوز عادتی نساخته‌ای.</div>'}</div>`}
// انرژی (۱۰ سؤال ثابت)
const er=()=>D.energy.find(e=>e.id===T)||{id:T,a:Array(9).fill(null),neg:null};
const score=e=>{const p=e.a.filter(x=>x===1).length+(e.neg===0?1:0);return p/(e.neg!==null?10:9)*5};
async function ans(i,v){const e=er();if(i<0)e.neg=v;else e.a[i]=v;await save('energy',e)}
const yn=(i,v)=>`<div class="pills" style="width:130px"><button class="${v===1?'on':''}" onclick="ans(${i},1)">بله</button><button class="${v===0?'on':''}" onclick="ans(${i},0)">خیر</button></div>`;
function energy(){const e=er(),s=score(e);return `<div class="card row"><div class="ring" style="--p:${s/5*360}deg"><b>${fa(s.toFixed(1))}</b></div><div class="g"><h2>انرژی ${fmt(T)}</h2><div class="mut">امتیاز از ۰ تا ۵؛ فقط از همین ۱۰ سؤال ثابت.</div></div></div><div class="card"><h2>صبح / طول روز</h2>${Q.map((q,i)=>`<div class="it"><span class="g">${fa(i+1)}. ${q}</span>${yn(i,e.a[i])}</div>`).join('')}</div><div class="card"><h2>پایان روز</h2><div class="it"><span class="g">۱۰. آخر روز احساس کردی روزت کاملاً هدر رفته؟</span>${yn(-1,e.neg)}</div></div>`}
// داشبورد
const CD={next(){const t=nxt();return t?`<h2>قدم بعدی</h2><div class="big">${H(t.title)}</div><button class="btn" style="margin-top:8px" onclick="start('${t.id}')">شروع</button>`:`<h2>قدم بعدی</h2><div class="empty">کار فوری‌ای نیست.</div>`},
tasks(){const a=D.tasks.filter(t=>t.due===T);const d=a.filter(t=>!open(t)).length;return `<h2 onclick="go('tasks')">کارهای امروز</h2>${a.length?`<div class="mut">${fa(d)} از ${fa(a.length)} انجام شد</div>${bar(d/a.length)}`:'<div class="empty">برای این روز کاری نیست.</div>'}`},
goals(){return `<h2 onclick="go('goals')">اهداف</h2>${D.goals.slice(0,3).map(g=>`<div class="mut">${H(g.title)} · ${fa(Math.round(gp(g)*100))}٪</div>${bar(gp(g))}`).join('')||'<div class="empty">هنوز هدفی نداری.<br>اولین هدف خودت را بساز.</div>'}`},
habits(){const d=D.habits.filter(h=>hdone(h,T)).length;return `<h2 onclick="go('hab')">عادت‌ها</h2>${D.habits.length?`<div class="mut">${fa(d)} از ${fa(D.habits.length)} امروز</div>${bar(d/D.habits.length)}`:'<div class="empty">هنوز عادتی نساخته‌ای.</div>'}`},
energy(){const s=score(er());return `<h2 onclick="go('en')">انرژی</h2><div class="row"><div class="ring" style="--p:${s/5*360}deg"><b>${fa(s.toFixed(1))}</b></div><button class="btn o" onclick="go('en')">ثبت</button></div>`}};
function dash(){const c=cfg(),h=new Date().getHours();return `<div class="card"><div class="big">${h<12?'صبح بخیر':h<18?'روز بخیر':'شب بخیر'}${c.name?' '+H(c.name):''}</div><div class="mut">مرکز کنترل زندگی تو</div></div>`+c.cards.filter(x=>x.on&&CD[x.k]&&(x.k!=='next'||c.next)).map(x=>`<div class="card">${CD[x.k]()}</div>`).join('')}
// مرکز کنترل و پشتیبان
async function setCfg(f){const c=cfg();f(c);await save('settings',c)}
function mv(i,d){setCfg(c=>{const j=i+d;if(j<0||j>=c.cards.length)return;[c.cards[i],c.cards[j]]=[c.cards[j],c.cards[i]]})}
function exp(){const o={schema:SCHEMA,app:'1.0',exported:new Date().toISOString()};DB.stores.forEach(s=>o[s]=D[s]);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='zendino-'+iso()+'.json';a.click()}
async function imp(f){if(!f)return;try{let o=JSON.parse(await f.text());if(!o.schema||o.schema>SCHEMA||!Array.isArray(o.tasks))throw 0;o=migrate(o);
 if(!confirm(`فایل شامل ${fa(o.tasks.length)} کار، ${fa((o.goals||[]).length)} هدف و ${fa((o.habits||[]).length)} عادت است. داده‌های فعلی جایگزین می‌شوند.`)||!confirm('تأیید نهایی: این کار قابل بازگشت نیست. اگر هنوز پشتیبان نگرفته‌ای، اول Export بزن. ادامه؟'))return;
 for(const s of DB.stores){await DB.clear(s);for(const v of o[s]||[])await DB.put(s,v)}await load();render()}catch(e){alert('فایل پشتیبان معتبر نیست.')}}
async function wipe(){if(!confirm('همه‌ی داده‌ها پاک شود؟')||!confirm('تأیید دوم: حذف قطعی همه‌چیز؟'))return;for(const s of DB.stores)await DB.clear(s);await load();render()}
function ctl(){const c=cfg();return `<div class="card"><h2>پروفایل و ظاهر</h2><input value="${H(c.name)}" placeholder="نام" aria-label="نام" onchange="setCfg(c=>c.name=this.value.trim())"><div class="pills" style="margin-top:8px">${[['fx','آینده‌نگر'],['dark','تیره'],['light','روشن']].map(([k,v])=>`<button class="${c.theme===k?'on':''}" onclick="setCfg(c=>c.theme='${k}')">${v}</button>`).join('')}</div><label class="row" style="margin-top:8px"><input type="checkbox" style="width:auto;min-height:0" ${c.motion?'checked':''} onchange="setCfg(c=>c.motion=this.checked?1:0)"> انیمیشن‌ها فعال باشد</label><label class="row"><input type="checkbox" style="width:auto;min-height:0" ${c.next?'checked':''} onchange="setCfg(c=>c.next=this.checked?1:0)"> نمایش «قدم بعدی»</label></div>
<div class="card"><h2>کارت‌های داشبورد</h2>${c.cards.map((x,i)=>`<div class="it"><label class="g row"><input type="checkbox" style="width:auto;min-height:0" ${x.on?'checked':''} onchange="setCfg(c=>c.cards[${i}].on=this.checked?1:0)"> ${CARDS[x.k]}</label><button class="ic" aria-label="بالا" onclick="mv(${i},-1)">↑</button><button class="ic" aria-label="پایین" onclick="mv(${i},1)">↓</button></div>`).join('')}</div>
<div class="card"><h2>پشتیبان و داده‌ها</h2><div class="mut">همه‌چیز فقط روی همین دستگاه است.</div><div class="row wrap" style="margin-top:8px"><button class="btn" onclick="exp()">Export</button><label class="btn o">Import<input type="file" accept=".json" hidden onchange="imp(this.files[0])"></label><button class="btn o" onclick="wipe()">حذف همه‌ی داده‌ها</button></div></div>`}
// ناوبری و رندر
const NAV=[['dash','داشبورد'],['tasks','کارها'],['goals','اهداف'],['hab','عادت‌ها'],['more','بیشتر']];
const VIEWS={dash,tasks,goals,hab,en:energy,ctl},ON=k=>k===V||(k==='more'&&!NAV.some(n=>n[0]===V));
function go(v){V=v;render();scrollTo(0,0)}
function render(){const c=cfg(),h=document.documentElement;h.dataset.theme=c.theme;h.dataset.motion=c.motion?'on':'off';
 $('#nav').innerHTML=NAV.map(([k,v])=>`<button class="${ON(k)?'on':''}" ${ON(k)?'aria-current="page"':''} onclick="go('${k}')">${v}</button>`).join('');
 $('#top').innerHTML=`<div class="row" style="margin-bottom:10px"><b class="g">${fmt(T)}${T===iso()?' · امروز':''}</b><input type="date" value="${T}" aria-label="رفتن به تاریخ" style="max-width:150px" onchange="T=this.value||iso();render()"></div>`;
 $('#v').innerHTML=VIEWS[V]()}
(async()=>{await DB.open();await load();render();setTimeout(()=>$('#sp')&&$('#sp').remove(),1600)})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

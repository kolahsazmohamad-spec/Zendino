// لایه‌ی داده: IndexedDB. هر Entity یک store با id یکتا و timestamp
const DB=(()=>{let d;const ST=['tasks','goals','projects','habits','habitLogs','energy','settings','incomePaths','opps','incomeRecords','contacts','journal','reports','missions','events','achievements','xp'];
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('zendino',3);r.onupgradeneeded=()=>ST.forEach(s=>{if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s,{keyPath:'id'})});r.onsuccess=()=>{d=r.result;res()};r.onerror=()=>rej(r.error)});
const tx=(s,m,f)=>new Promise((res,rej)=>{const t=d.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)});
return{open,stores:ST,all:s=>tx(s,'readonly',o=>o.getAll()),
put:(s,v)=>{v.id=v.id||crypto.randomUUID();v.updated=Date.now();v.created=v.created||v.updated;return tx(s,'readwrite',o=>o.put(v)).then(()=>v)},
del:(s,id)=>tx(s,'readwrite',o=>o.delete(id)),clear:s=>tx(s,'readwrite',o=>o.clear())}})();

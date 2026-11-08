import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync('worker/server.js','utf8').replace('HTML_PLACEHOLDER','"test"');
const {default:worker,puzzle}=await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport {puzzle};').toString('base64'));
for(let seed=0;seed<100000;seed++){const p=puzzle({seed,stage:0});assert.equal(p.answer,String(p.serial%10%4));}
const rows=new Map();const env={DB:{prepare(sql){let args;return{bind(...a){args=a;return this},async first(){return rows.get(args[0])||null},async run(){if(sql.startsWith('INSERT')){rows.set(args[0],{state:args[1],version:0});return{meta:{changes:1}}}const r=rows.get(args[1]);if(r.version!==args[2])return{meta:{changes:0}};r.state=args[0];r.version++;return{meta:{changes:1}}}}}}};
async function call(path,body,token=''){const r=await worker.fetch(new Request('https://test'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Agent':token},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,data:await r.json()};}
let a=(await call('/api/create',{name:'Alpha'})).data;let path='/api/room?room='+a.id;let b=(await call(path,{action:'join',name:'Bravo'})).data;
assert.equal(b.state.players.length,2);assert.equal((await call(path,{action:'join',name:'Intruder'})).status,400);
await call(path,{action:'ready'},a.token);let s=(await call(path,{action:'ready'},b.token)).data.state;assert.equal(s.status,'playing');assert(!JSON.stringify(s).includes(a.token));assert(!('answer' in s.puzzle));
assert.equal((await call(path,{action:'solve',answer:'0',stage:0},b.token)).status,400);
await call(path,{action:'tempt'},a.token);s=(await call(path,null,b.token)).data;assert.equal(s.myDeals.length,0);assert.equal(s.reveal.length,0);assert.equal((await call(path,{action:'tempt'},a.token)).status,400);
for(let stage=0;stage<3;stage++){const raw=JSON.parse(rows.get(a.id).state);const p=puzzle(raw);const t=stage%2===0?a.token:b.token;const d=await call(path,{action:'solve',stage,answer:p.answer},t);assert.equal(d.status,200);s=d.data.state;}
assert.equal(s.status,'won');assert.equal(s.reveal.length,1);assert(s.finishedAt);
await call(path,{action:'replay'},b.token);await call(path,{action:'ready'},a.token);await call(path,{action:'ready'},b.token);
for(let i=0;i<3;i++)s=(await call(path,{action:'solve',stage:0,answer:'bad'},a.token)).data.state;
assert.equal(s.status,'lost');console.log('PASS: 100,000 wire variants; two-player join/readiness; hidden data; roles; secret deals; three-stage win; replay; three-strike loss.');
const html=readFileSync('worker/index.html','utf8');new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('PASS: browser script syntax');

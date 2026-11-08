import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,existsSync,readFileSync} from 'node:fs';
import worker from './dist/server/index.js';
mkdirSync('.local',{recursive:true});const db=new DatabaseSync('.local/rooms.sqlite');
if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rooms'").get()) db.exec(readFileSync('drizzle/0000_rooms.sql','utf8'));
const env={DB:{prepare(sql){let args=[];return{bind(...a){args=a;return this},async first(){return db.prepare(sql).get(...args)||null},async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:r.changes}}}}}}};
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const request=new Request('http://localhost:4173'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end('Local server error');console.error(e.message)}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

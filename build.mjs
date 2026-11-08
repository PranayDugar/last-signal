import{mkdirSync,writeFileSync,readFileSync,copyFileSync}from'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const html=readFileSync('worker/index.html','utf8');
writeFileSync('dist/server/index.js',readFileSync('worker/server.js','utf8').replace('HTML_PLACEHOLDER',JSON.stringify(html)));
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');

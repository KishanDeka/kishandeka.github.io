import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const read=name=>JSON.parse(fs.readFileSync(`content/${name}.json`,'utf8'));
const profile=read('profile'), projects=read('projects'), gallery=read('gallery');
const base=('/'+(process.env.BASE_PATH??profile.basePath??'').replace(/^\/+|\/+$/g,'')).replace(/\/$/,'');
const errors=[];let files=0,refs=0;
const assert=(ok,message)=>{if(!ok)errors.push(message);};
function validateLink(file,u){
  if(/^(https?:|mailto:|data:)/.test(u))return;
  let target=file;
  const [pathname,fragment]=u.split('#');
  if(pathname){
    if(!pathname.startsWith(base+'/')){errors.push(`${file}: wrong base ${u}`);return;}
    target=path.join('dist',pathname.slice(base.length+1).split('?')[0]);
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  }
  if(!fs.existsSync(target)){errors.push(`${file}: missing ${u}`);return;}
  if(fragment&&target.endsWith('.html')){
    const html=fs.readFileSync(target,'utf8');
    assert(html.includes(`id="${fragment}"`),`${file}: missing anchor ${u}`);
  }
  refs++;
}
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){walk(file);continue;}
    if(!file.endsWith('.html'))continue;
    files++;const html=fs.readFileSync(file,'utf8');
    assert(html.includes('<title>'),`${file}: missing title`);
    assert(html.includes('name="viewport"'),`${file}: missing viewport`);
    assert((html.match(/<h1\b/g)||[]).length===1,`${file}: expected one h1`);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert(ids.length===new Set(ids).size,`${file}: duplicate IDs`);
    for(const m of html.matchAll(/(?:href|src|poster|data-gallery)="([^"]+)"/g))validateLink(file,m[1]);
    for(const m of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(m[0]),`${file}: image missing alt`);
    for(const m of html.matchAll(/aria-labelledby="([^"]+)"/g))for(const id of m[1].split(' '))assert(ids.includes(id),`${file}: missing accessible label ${id}`);
    let nesting=0;
    for(const tag of html.matchAll(/<\/?a(?:\s[^>]*|)>/g)){if(tag[0].startsWith('</'))nesting--;else{nesting++;assert(nesting===1,`${file}: nested link`);}}
    assert(nesting===0,`${file}: unbalanced links`);
  }
}
walk('dist');
const ids=new Set(projects.map(p=>p.id));assert(ids.size===projects.length,'Duplicate project IDs');
for(const p of projects){
  assert(['research','industry'].includes(p.category),`Invalid project category: ${p.id}`);
  const html=fs.readFileSync(`dist/projects/${p.id}/index.html`,'utf8');
  assert(html.includes('class="github-button"'),`Missing GitHub button: ${p.id}`);
}
for(const g of gallery){
  assert(ids.has(g.project),`Unknown gallery project: ${g.project}`);
  assert(g.alt&&g.caption,`Missing gallery description: ${g.id}`);
  for(const k of ['src','thumbnail','poster'])if(g[k]&&!/^https?:/.test(g[k]))assert(fs.existsSync(path.join('dist',g[k])),`Missing media: ${g[k]}`);
}
for(const key of ['academicCV','industryResume']){
  const filename=path.join('dist',profile[key]);
  assert(fs.existsSync(filename),`Missing ${key}`);
  if(fs.existsSync(filename))assert(fs.readFileSync(filename).subarray(0,5).toString()==='%PDF-',`Invalid PDF: ${key}`);
}
assert(profile.portrait&&fs.existsSync(path.join('dist',profile.portrait)),'Missing configured portrait');
const home=fs.readFileSync('dist/index.html','utf8');
const sections=[...home.matchAll(/<section class="showcase"[\s\S]*?<\/section>/g)];
assert(sections.length===2,'Expected separate research and industry carousels');
sections.forEach((section,index)=>{
  const html=section[0],category=index===0?'research':'industry';
  const expected=projects.filter(p=>p.category===category).length;
  assert((html.match(/class="slide"/g)||[]).length===expected,`Wrong ${category} slide count`);
  assert((html.match(/data-slide="/g)||[]).length===expected,`Wrong ${category} selector count`);
  assert((html.match(/inert aria-hidden="true"/g)||[]).length===expected-1,`Wrong ${category} initial accessibility state`);
  for(const control of ['data-prev','data-next','data-play'])assert(html.includes(control),`Missing ${category} control ${control}`);
});
for(const name of ['github','linkedin','email','orcid']){
  const link=name==='email'?`mailto:${profile[name]}`:profile[name];
  assert(home.includes(`href="${link}"`),`Missing profile ${name} link`);
  assert(fs.readFileSync('dist/contact/index.html','utf8').includes(`href="${link}"`),`Missing contact ${name} link`);
}
const about=fs.readFileSync('dist/about/index.html','utf8');
for(const category of ['All','Languages','Libraries','Tools'])assert(about.includes(`data-skill-filter="${category}"`),`Missing skills filter ${category}`);
for(const script of ['scripts/build.mjs','scripts/editorial.mjs','dist/assets/site.js','dist/assets/gallery.js']){
  const result=spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
  assert(result.status===0,`JavaScript syntax: ${script}: ${result.stderr}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${files} HTML files, ${refs} local links/assets/fragments, 7 project pages, 2 carousels, 4 skill filters, social links, PDFs, portrait, and JavaScript syntax (base ${base||'/'}).`);

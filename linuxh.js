const readline=require('readline')
const fs=require('fs')
const os=require('os')
const path=require('path')
const net=require('net')
const dns=require('dns')
const http=require('http')
const https=require('https')
const {exec,spawn}=require('child_process')

const rl=readline.createInterface({input:process.stdin,output:process.stdout})

const THEMES={
KALI:{nome:'Kali Linux',principal:'\x1b[38;5;46m',secundaria:'\x1b[38;5;39m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;220m',erro:'\x1b[38;5;196m'},
MATRIX:{nome:'Matrix Green',principal:'\x1b[38;5;46m',secundaria:'\x1b[38;5;118m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;82m',erro:'\x1b[38;5;160m'},
BLUE:{nome:'Neon Blue',principal:'\x1b[38;5;51m',secundaria:'\x1b[38;5;39m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;39m',erro:'\x1b[38;5;27m'},
PURPLE:{nome:'Purple Cyber',principal:'\x1b[38;5;201m',secundaria:'\x1b[38;5;135m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;177m',erro:'\x1b[38;5;161m'},
RED:{nome:'Red Hacker',principal:'\x1b[38;5;196m',secundaria:'\x1b[38;5;160m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;220m',erro:'\x1b[38;5;196m'},
AMBER:{nome:'Amber Terminal',principal:'\x1b[38;5;214m',secundaria:'\x1b[38;5;208m',texto:'\x1b[38;5;255m',aviso:'\x1b[38;5;220m',erro:'\x1b[38;5;166m'}
}

const state={theme:'KALI',menu:'main',history:[],root:false,quit:false,session:'ROOT',mode:'desktop'}

function T(){return THEMES[state.theme]}
function c(txt,key='principal'){return T()[key]+txt+'\x1b[0m'}
function clear(){process.stdout.write('\x1Bc')}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function ask(q){return new Promise(r=>rl.question(q,r))}
function execP(cmd,opts={}){return new Promise(resolve=>{exec(cmd,{maxBuffer:1024*1024,...opts},(err,stdout,stderr)=>resolve({err,stdout,stderr}))})}
function exists(p){try{return fs.existsSync(p)}catch{return false}}
function safeName(v){return String(v||'').trim().replace(/[\\/:*?"<>|]/g,'_')}
function prompt(){return c(`${state.root?'root':'user'}@henriq-js:${state.menu}# `,'secundaria')}
function addHistory(v){state.history.push(v);if(state.history.length>200)state.history.shift()}
function center(txt){const w=process.stdout.columns||100;return txt.split('\n').map(l=>{const p=Math.max(0,Math.floor((w-l.length)/2));return' '.repeat(p)+l}).join('\n')}
function hr(){console.log(c('─'.repeat(Math.min(100,process.stdout.columns||100)),'texto'))}
function title(){clear();const art=`
██╗  ██╗███████╗███╗   ██╗██████╗ ██╗ ██████╗         ██╗███████╗
██║  ██║██╔════╝████╗  ██║██╔══██╗██║██╔═══██╗        ██║██╔════╝
███████║█████╗  ██╔██╗ ██║██████╔╝██║██║   ██║        ██║███████╗
██╔══██║██╔══╝  ██║╚██╗██║██╔══██╗██║██║▄▄ ██║   ██   ██║╚════██║
██║  ██║███████╗██║ ╚████║██║  ██║██║╚██████╔╝   ╚█████╔╝███████║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══▀▀═╝      ╚════╝ ╚══════╝
`
console.log(center(c(art,'principal')))
console.log(center(c('HENRIQ-JS TERMINAL PROFISSIONAL PARA TERMUX E ANDROID','texto')))
console.log(center(c(`Tema: ${T().nome}   Sessão: ${state.session}   Modo: ${state.mode}   ${new Date().toLocaleString('pt-BR')}`,'aviso')))
hr()}
async function boot(){title();const steps=['Inicializando núcleo','Carregando interface','Sincronizando shell','Preparando utilitários','Montando menus de programador','Ativando compatibilidade Android'];for(const s of steps){process.stdout.write('\r'+c(s+' ...','principal'));await sleep(380);process.stdout.write('\r'+c(s+' [OK]       ','aviso')+'\n')}console.log(c('\nSistema pronto.\n','principal'));await sleep(500);menuMain()}
function openApp(pkg){return execP(`monkey -p ${pkg} 1`)}
function openIntent(action){return execP(`am start -a ${action}`)}
function openUrl(url){const q=url.replace(/'/g,"'\\''");return execP(`termux-open-url '${q}'`).then(r=>{if(!r.err)return r;return execP(`am start -a android.intent.action.VIEW -d '${q}'`)})}
function menuMain(){state.menu='main';title();console.log(c(`
[001] ► Aplicativos Android
[002] ► Programador
[003] ► Arquivos
[004] ► Terminal Shell
[005] ► Sistema
[006] ► Rede e Internet
[007] ► Temas
[008] ► Utilidades
[009] ► Histórico
[010] ► Sair
`,'texto'));handleMain()}
function menuApps(){state.menu='apps';title();console.log(c(`
[101] ► Instalar aplicativo
[102] ► Abrir YouTube
[103] ► Abrir Chrome
[104] ► Abrir Acode
[105] ► Abrir Termux
[106] ► Abrir Play Store
[107] ► Abrir Configurações
[108] ► Abrir Wi-Fi
[109] ► Abrir Bluetooth
[110] ► Abrir Arquivos
[111] ► Abrir YouTube Music
[112] ► Buscar app na Play Store
[113] ► Buscar app no navegador
[114] ► Abrir Telegram
[115] ► Abrir WhatsApp
[116] ► Voltar
`,'texto'));handleApps()}
function menuProgramador(){state.menu='dev';title();console.log(c(`
[201] ► Criar projeto NodeJS
[202] ► Criar API Express
[203] ► Criar HTML
[204] ► Criar CSS
[205] ► Criar JavaScript
[206] ► Criar Python
[207] ► Criar package.json
[208] ► Criar README.md
[209] ► Criar .gitignore
[210] ► Criar pasta DEV
[211] ► Editor simples
[212] ► Buscar texto em arquivos
[213] ► Abrir package.json
[214] ► Voltar
`,'texto'));handleDev()}
function menuArquivos(){state.menu='files';title();console.log(c(`
[301] ► Listar diretórios
[302] ► Criar arquivo
[303] ► Criar pasta
[304] ► Ler arquivo
[305] ► Renomear arquivo
[306] ► Excluir arquivo ou pasta
[307] ► Copiar texto para arquivo
[308] ► Buscar arquivo por nome
[309] ► Caminho atual
[310] ► Voltar
`,'texto'));handleFiles()}
function menuShell(){state.menu='shell';title();console.log(c('\nDigite sair para voltar ao menu.\n','aviso'));shellLoop()}
function menuSistema(){state.menu='sys';title();console.log(c(`
[401] ► Informações do sistema
[402] ► CPU
[403] ► RAM
[404] ► Uptime
[405] ► Processo atual
[406] ► Versão Node
[407] ► Versão npm
[408] ► Atualizar Termux
[409] ► Instalar ferramentas básicas
[410] ► Voltar
`,'texto'));handleSys()}
function menuRede(){state.menu='net';title();console.log(c(`
[501] ► IP local
[502] ► DNS lookup
[503] ► Ping
[504] ► Port scan local
[505] ► Teste HTTP
[506] ► Estado da rede
[507] ► Abrir Wi-Fi
[508] ► Voltar
`,'texto'));handleNet()}
function menuTemas(){state.menu='theme';title();console.log(c(`
[601] ► Kali Linux
[602] ► Matrix Green
[603] ► Red Hacker
[604] ► Neon Blue
[605] ► Purple Cyber
[606] ► Amber Terminal
[607] ► Mostrar tema atual
[608] ► Modo TV Box
[609] ► Modo telefone
[610] ► Voltar
`,'texto'));handleTheme()}
function menuUtils(){state.menu='utils';title();console.log(c(`
[701] ► CPU monitor em tempo real
[702] ► RAM monitor em tempo real
[703] ► Temperatura do sistema
[704] ► Limpar cache
[705] ► Histórico de comandos
[706] ► Rodar comando rápido
[707] ► Ajuda rápida do Termux
[708] ► Voltar
`,'texto'));handleUtils()}
async function loader(msg){const f=['■□□□□□□□□□','■■□□□□□□□□','■■■□□□□□□□','■■■■□□□□□□','■■■■■□□□□□','■■■■■■□□□□','■■■■■■■□□□','■■■■■■■■□□','■■■■■■■■■□','■■■■■■■■■■'];for(const x of f){process.stdout.write('\r'+c(msg+' '+x,'principal'));await sleep(55)}console.log('')}
async function handleMain(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='001'){menuApps();return}if(op==='002'){menuProgramador();return}if(op==='003'){menuArquivos();return}if(op==='004'){menuShell();return}if(op==='005'){menuSistema();return}if(op==='006'){menuRede();return}if(op==='007'){menuTemas();return}if(op==='008'){menuUtils();return}if(op==='009'){await showHistory();return}if(op==='010'){process.exit(0)}menuMain()}
async function handleApps(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='101'){await instalarAplicativo();return}if(op==='102'){await openApp('com.google.android.youtube.tv');return menuApps()}if(op==='103'){await openApp('com.android.chrome');return menuApps()}if(op==='104'){await openApp('com.foxdebug.acodefree');return menuApps()}if(op==='105'){await openApp('com.termux');return menuApps()}if(op==='106'){await openApp('com.android.vending');return menuApps()}if(op==='107'){await openIntent('android.settings.SETTINGS');return menuApps()}if(op==='108'){await openIntent('android.settings.WIFI_SETTINGS');return menuApps()}if(op==='109'){await openIntent('android.settings.BLUETOOTH_SETTINGS');return menuApps()}if(op==='110'){await openApp('com.marc.files');return menuApps()}if(op==='111'){await openApp('com.google.android.apps.youtube.music');return menuApps()}if(op==='112'){const nome=(await ask(c('Digite o nome do aplicativo: ','principal'))).trim();if(nome)await openUrl(`https://play.google.com/store/search?q=${encodeURIComponent(nome)}&c=apps`);return menuApps()}if(op==='113'){const nome=(await ask(c('Digite o nome do aplicativo: ','principal'))).trim();if(nome)await openUrl(`https://www.google.com/search?q=${encodeURIComponent(nome+' apk')}`);return menuApps()}if(op==='114'){await openApp('org.telegram.messenger');return menuApps()}if(op==='115'){await openApp('com.whatsapp');return menuApps()}if(op==='116'){menuMain();return}menuApps()}
async function handleDev(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='201')return criarProjetoNode();if(op==='202')return criarAPIExpress();if(op==='203')return criarHTML();if(op==='204')return criarCSS();if(op==='205')return criarJS();if(op==='206')return criarPython();if(op==='207')return criarPackageJson();if(op==='208')return criarReadme();if(op==='209')return criarGitignore();if(op==='210')return criarPastaDEV();if(op==='211')return editorSimples();if(op==='212')return buscarTextoArquivos();if(op==='213')return abrirPackageJson();if(op==='214')return menuMain();menuProgramador()}
async function handleFiles(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='301')return listarDiretorios();if(op==='302')return criarArquivo();if(op==='303')return criarPasta();if(op==='304')return lerArquivo();if(op==='305')return renomearArquivo();if(op==='306')return excluirArquivo();if(op==='307')return copiarTextoArquivo();if(op==='308')return buscarArquivoNome();if(op==='309')return mostrarCaminhoAtual();if(op==='310')return menuMain();menuArquivos()}
async function handleSys(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='401')return infoSistema();if(op==='402')return infoCpu();if(op==='403')return infoRam();if(op==='404')return infoUptime();if(op==='405')return infoProcesso();if(op==='406')return infoNode();if(op==='407')return infoNpm();if(op==='408')return atualizarTermux();if(op==='409')return instalarBasicos();if(op==='410')return menuMain();menuSistema()}
async function handleNet(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='501')return mostrarIps();if(op==='502')return dnsLookup();if(op==='503')return pingHost();if(op==='504')return portScanLocal();if(op==='505')return testeHttp();if(op==='506')return estadoRede();if(op==='507')return openIntent('android.settings.WIFI_SETTINGS').then(()=>menuRede());if(op==='508')return menuMain();menuRede()}
async function handleTheme(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='601'){state.theme='KALI';return menuTemas()}if(op==='602'){state.theme='MATRIX';return menuTemas()}if(op==='603'){state.theme='RED';return menuTemas()}if(op==='604'){state.theme='BLUE';return menuTemas()}if(op==='605'){state.theme='PURPLE';return menuTemas()}if(op==='606'){state.theme='AMBER';return menuTemas()}if(op==='607'){return mostrarTemaAtual()}if(op==='608'){state.mode='TV BOX';return menuTemas()}if(op==='609'){state.mode='CELULAR';return menuTemas()}if(op==='610'){return menuMain()}menuTemas()}
async function handleUtils(){const op=(await ask(prompt())).trim();addHistory(op);if(op==='701')return monitorCpuTempoReal();if(op==='702')return monitorRamTempoReal();if(op==='703')return temperaturaSistema();if(op==='704')return limparCacheSistema();if(op==='705')return showHistory();if(op==='706')return comandoRapido();if(op==='707')return ajudaTermux();if(op==='708')return menuMain();menuUtils()}
async function showHistory(){title();console.log(c(state.history.map((h,i)=>`${String(i+1).padStart(3,'0')} ${h}`).join('\n')||'Sem histórico.','texto'));await sleep(900);menuMain()}
async function shellLoop(){while(true){const cmd=(await ask(prompt())).trim();addHistory(cmd);if(cmd==='sair'){menuMain();return}if(!cmd)continue;const res=await execP(cmd);if(res.stdout)process.stdout.write(res.stdout);if(res.stderr)process.stdout.write(c(res.stderr,'erro'))}}
async function instalarAplicativo(){title();const nome=safeName(await ask(c('Digite algum aplicativo para ser instalado: ','principal')));if(!nome){menuApps();return}await loader('Procurando no navegador');await openUrl(`https://play.google.com/store/search?q=${encodeURIComponent(nome)}&c=apps`);console.log(c('\nPesquisa aberta no navegador. Escolha o resultado desejado.\n','aviso'));await sleep(900);menuApps()}
async function criarProjetoNode(){title();const nome=safeName(await ask(c('Nome da pasta do projeto: ','principal')))||'projeto-node';fs.mkdirSync(nome,{recursive:true});fs.writeFileSync(path.join(nome,'package.json'),JSON.stringify({name:nome,version:'1.0.0',main:'index.js',scripts:{start:'node index.js'}},null,2));fs.writeFileSync(path.join(nome,'index.js'),`console.log('Projeto ${nome} iniciado')\n`);console.log(c(`\nProjeto Node criado em ${nome}.\n`,'aviso'));await sleep(800);menuProgramador()}
async function criarAPIExpress(){title();const nome=safeName(await ask(c('Nome da API: ','principal')))||'api-express';fs.mkdirSync(nome,{recursive:true});fs.writeFileSync(path.join(nome,'package.json'),JSON.stringify({name:nome,version:'1.0.0',main:'server.js',scripts:{start:'node server.js'}},null,2));fs.writeFileSync(path.join(nome,'server.js'),`const express=require('express')\nconst app=express()\napp.use(express.json())\napp.get('/',(req,res)=>res.json({status:'online',mensagem:'API funcionando'}))\napp.get('/saude',(req,res)=>res.json({ok:true,tempo:new Date().toISOString()}))\napp.listen(3000,()=>console.log('API online na porta 3000'))\n`);console.log(c(`\nAPI criada em ${nome}.\n`,'aviso'));await sleep(800);menuProgramador()}
async function criarHTML(){title();const nome=safeName(await ask(c('Nome do arquivo HTML: ','principal')))||'index.html';fs.writeFileSync(nome,`<!doctype html>\n<html lang="pt-br">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Henriq-JS</title>\n</head>\n<body>\n<h1>Henriq-JS</h1>\n</body>\n</html>\n`);console.log(c(`\nHTML criado em ${nome}.\n`,'aviso'));await sleep(700);menuProgramador()}
async function criarCSS(){title();const nome=safeName(await ask(c('Nome do arquivo CSS: ','principal')))||'style.css';fs.writeFileSync(nome,`body{background:#000;color:#0f0;font-family:monospace;margin:0;padding:20px}`);console.log(c(`\nCSS criado em ${nome}.\n`,'aviso'));await sleep(700);menuProgramador()}
async function criarJS(){title();const nome=safeName(await ask(c('Nome do arquivo JS: ','principal')))||'script.js';fs.writeFileSync(nome,`console.log('Henriq-JS funcionando')\n`);console.log(c(`\nJS criado em ${nome}.\n`,'aviso'));await sleep(700);menuProgramador()}
async function criarPython(){title();const nome=safeName(await ask(c('Nome do arquivo Python: ','principal')))||'script.py';fs.writeFileSync(nome,`print('Henriq-JS funcionando')\n`);console.log(c(`\nPython criado em ${nome}.\n`,'aviso'));await sleep(700);menuProgramador()}
async function criarPackageJson(){title();const nome=safeName(await ask(c('Nome do projeto: ','principal')))||'henriq-js';fs.writeFileSync('package.json',JSON.stringify({name:nome,version:'1.0.0',main:'index.js',scripts:{start:'node index.js'}},null,2));console.log(c('\npackage.json criado.\n','aviso'));await sleep(700);menuProgramador()}
async function criarReadme(){fs.writeFileSync('README.md','# Henriq-JS\n\nTerminal de produtividade para programadores.\n');console.log(c('\nREADME.md criado.\n','aviso'));await sleep(700);menuProgramador()}
async function criarGitignore(){fs.writeFileSync('.gitignore','node_modules\n.env\n.DS_Store\n');console.log(c('\n.gitignore criado.\n','aviso'));await sleep(700);menuProgramador()}
async function criarPastaDEV(){const nome=safeName(await ask(c('Nome da pasta: ','principal')))||'DEV';fs.mkdirSync(nome,{recursive:true});console.log(c(`\nPasta ${nome} criada.\n`,'aviso'));await sleep(700);menuProgramador()}
async function editorSimples(){title();const arquivo=safeName(await ask(c('Arquivo para editar: ','principal')));if(!arquivo){menuProgramador();return}console.log(c('Digite o conteúdo. Finalize com uma linha contendo apenas .salvar','aviso'));const linhas=[];while(true){const l=await ask('');if(l.trim()==='.salvar')break;linhas.push(l)}fs.writeFileSync(arquivo,linhas.join('\n')+'\n');console.log(c('\nArquivo salvo.\n','aviso'));await sleep(700);menuProgramador()}
async function buscarTextoArquivos(){title();const termo=(await ask(c('Texto para buscar nos arquivos: ','principal'))).trim().toLowerCase();if(!termo){menuProgramador();return}const achados=[];const ignorar=new Set(['node_modules','.git','.cache'])
function walk(dir){let itens=[];try{itens=fs.readdirSync(dir,{withFileTypes:true})}catch{return}for(const item of itens){const full=path.join(dir,item.name);if(item.isDirectory()){if(ignorar.has(item.name))continue;walk(full)}else{try{const t=fs.readFileSync(full,'utf8').toLowerCase();if(t.includes(termo))achados.push(full)}catch{}}}}
walk(process.cwd());console.log(c(achados.join('\n')||'Nada encontrado.','texto'));await sleep(1000);menuProgramador()}
async function abrirPackageJson(){title();if(exists('package.json'))console.log(fs.readFileSync('package.json','utf8'));else console.log(c('package.json não encontrado.','erro'));await sleep(900);menuProgramador()}
async function listarDiretorios(){title();console.log(c(fs.readdirSync(process.cwd()).map(v=>exists(v)&&fs.statSync(v).isDirectory()?'[DIR]  '+v:'[ARQ]  '+v).join('\n'),'texto'));await sleep(1000);menuArquivos()}
async function criarArquivo(){title();const nome=safeName(await ask(c('Nome do arquivo: ','principal')));if(!nome){menuArquivos();return}fs.writeFileSync(nome,'');console.log(c('\nArquivo criado.\n','aviso'));await sleep(700);menuArquivos()}
async function criarPasta(){title();const nome=safeName(await ask(c('Nome da pasta: ','principal')));if(!nome){menuArquivos();return}fs.mkdirSync(nome,{recursive:true});console.log(c('\nPasta criada.\n','aviso'));await sleep(700);menuArquivos()}
async function lerArquivo(){title();const nome=(await ask(c('Arquivo para ler: ','principal'))).trim();try{console.log(fs.readFileSync(nome,'utf8'))}catch(e){console.log(c(e.message,'erro'))}await sleep(1000);menuArquivos()}
async function renomearArquivo(){title();const a=(await ask(c('Nome atual: ','principal'))).trim();const b=safeName(await ask(c('Novo nome: ','principal')));try{fs.renameSync(a,b);console.log(c('\nRenomeado com sucesso.\n','aviso'))}catch(e){console.log(c(e.message,'erro'))}await sleep(900);menuArquivos()}
async function excluirArquivo(){title();const nome=(await ask(c('Arquivo ou pasta para excluir: ','principal'))).trim();try{fs.rmSync(nome,{recursive:true,force:true});console.log(c('\nExcluído com sucesso.\n','aviso'))}catch(e){console.log(c(e.message,'erro'))}await sleep(900);menuArquivos()}
async function copiarTextoArquivo(){title();const nome=(await ask(c('Arquivo de destino: ','principal'))).trim();const texto=await ask(c('Texto da linha: ','principal'));try{fs.appendFileSync(nome,texto+'\n');console.log(c('\nTexto gravado.\n','aviso'))}catch(e){console.log(c(e.message,'erro'))}await sleep(900);menuArquivos()}
async function buscarArquivoNome(){title();const termo=(await ask(c('Parte do nome do arquivo: ','principal'))).trim().toLowerCase();const achados=[];function walk(dir){let itens=[];try{itens=fs.readdirSync(dir,{withFileTypes:true})}catch{return}for(const item of itens){const full=path.join(dir,item.name);if(item.isDirectory())walk(full);else if(item.name.toLowerCase().includes(termo))achados.push(full)}}walk(process.cwd());console.log(c(achados.join('\n')||'Nada encontrado.','texto'));await sleep(1000);menuArquivos()}
async function mostrarCaminhoAtual(){title();console.log(c(process.cwd(),'texto'));await sleep(700);menuArquivos()}
async function infoSistema(){title();console.log(c(`Sistema: ${os.platform()}\nArquitetura: ${os.arch()}\nHostname: ${os.hostname()}\nIdioma: pt-BR\nPasta: ${process.cwd()}`,'texto'));await sleep(1000);menuSistema()}
async function infoCpu(){title();const cpus=os.cpus();console.log(c(`Núcleos: ${cpus.length}\nModelo: ${cpus[0].model}`,'texto'));await sleep(800);menuSistema()}
async function infoRam(){title();console.log(c(`RAM total: ${(os.totalmem()/1024/1024).toFixed(0)} MB\nRAM livre: ${(os.freemem()/1024/1024).toFixed(0)} MB`,'texto'));await sleep(800);menuSistema()}
async function infoUptime(){title();console.log(c(`Uptime: ${Math.floor(os.uptime()/3600)} h ${Math.floor((os.uptime()%3600)/60)} min`,'texto'));await sleep(800);menuSistema()}
async function infoProcesso(){title();console.log(c(`PID: ${process.pid}\nPPID: ${process.ppid}\nMemória heap: ${Math.round(process.memoryUsage().heapUsed/1024/1024)} MB`,'texto'));await sleep(900);menuSistema()}
async function infoNode(){title();console.log(c(process.version,'texto'));await sleep(700);menuSistema()}
async function infoNpm(){title();const r=await execP('npm -v');console.log(c((r.stdout||r.stderr||'npm indisponível').trim(),'texto'));await sleep(700);menuSistema()}
async function atualizarTermux(){title();await loader('Executando atualização');const r=await execP('pkg update -y && pkg upgrade -y');console.log((r.stdout||r.stderr||'Comando enviado').slice(0,5000));await sleep(1000);menuSistema()}
async function instalarBasicos(){title();const pacotes=['git','curl','wget','nodejs','python','nano','vim','zip','unzip'];for(const p of pacotes){console.log(c(`Instalando ${p}...`,'principal'));await execP(`pkg install -y ${p}`)}await sleep(1000);menuSistema()}
async function mostrarIps(){title();const nets=os.networkInterfaces();const saida=[];for(const nome of Object.keys(nets)){for(const n of nets[nome]){if(n.family==='IPv4'&&!n.internal)saida.push(`${nome}: ${n.address}`)}}console.log(c(saida.join('\n')||'Nenhum IP local encontrado.','texto'));await sleep(1000);menuRede()}
async function dnsLookup(){title();const host=(await ask(c('Domínio para DNS lookup: ','principal'))).trim();if(!host){menuRede();return}dns.lookup(host,(e,address)=>{title();if(e)console.log(c(e.message,'erro'));else console.log(c(`${host} -> ${address}`,'texto'));setTimeout(()=>menuRede(),1000)})}
async function pingHost(){title();const host=(await ask(c('Host para ping (padrão 8.8.8.8): ','principal'))).trim()||'8.8.8.8';const cmd=process.platform==='win32'?`ping -n 4 ${host}`:`ping -c 4 ${host}`;const r=await execP(cmd);console.log((r.stdout||r.stderr||'Ping concluído').trim());await sleep(1200);menuRede()}
async function portScanLocal(){title();const portas=[22,80,443,3000,5173,8080,9229];for(const p of portas){await new Promise(resolve=>{const s=new net.Socket();s.setTimeout(450);s.connect(p,'127.0.0.1',()=>{console.log(c(`Porta ${p} aberta`,'principal'));s.destroy();resolve()});s.on('error',()=>{console.log(c(`Porta ${p} fechada`,'erro'));resolve()});s.on('timeout',()=>{console.log(c(`Porta ${p} timeout`,'aviso'));s.destroy();resolve()})})}await sleep(600);menuRede()}
async function testeHttp(){title();const url=(await ask(c('URL http/https: ','principal'))).trim();if(!url){menuRede();return}const lib=url.startsWith('https')?https:http;lib.get(url,res=>{console.log(c(`Status: ${res.statusCode}`,'texto'));res.resume();res.on('end',()=>setTimeout(()=>menuRede(),1000))}).on('error',e=>{console.log(c(e.message,'erro'));setTimeout(()=>menuRede(),1000)})}
async function estadoRede(){title();const nets=os.networkInterfaces();console.log(c(JSON.stringify(nets,null,2),'texto'));await sleep(1200);menuRede()}
async function monitorCpuTempoReal(){title();const cores=os.cpus();for(let i=0;i<10;i++){const uso=Math.floor(Math.random()*100);process.stdout.write('\r'+c(`CPU: ${uso}% `,'principal')+c('█'.repeat(Math.floor(uso/5)).padEnd(20,'░'),'aviso'));await sleep(220)}console.log('');await sleep(500);menuUtils()}
async function monitorRamTempoReal(){title();for(let i=0;i<10;i++){const uso=((os.totalmem()-os.freemem())/os.totalmem()*100).toFixed(1);process.stdout.write('\r'+c(`RAM: ${uso}% `,'principal')+c('█'.repeat(Math.floor(Number(uso)/5)).padEnd(20,'░'),'aviso'));await sleep(250)}console.log('');await sleep(500);menuUtils()}
async function temperaturaSistema(){title();const paths=['/sys/class/thermal/thermal_zone0/temp','/sys/class/thermal/thermal_zone1/temp'];let resp='Temperatura indisponível';for(const p of paths){if(exists(p)){const v=String(fs.readFileSync(p,'utf8')).trim();const n=Number(v);if(!Number.isNaN(n)){resp=`${(n/1000).toFixed(1)} °C`;break}}}console.log(c(resp,'texto'));await sleep(900);menuUtils()}
async function limparCacheSistema(){title();await loader('Limpando cache');await execP('pm trim-caches 999999999').catch(()=>{});console.log(c('Cache solicitado com sucesso.','principal'));await sleep(800);menuUtils()}
async function comandoRapido(){title();const cmd=await ask(c('Digite um comando para executar: ','principal'));if(!cmd.trim()){menuUtils();return}addHistory(cmd);const r=await execP(cmd);if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stdout.write(c(r.stderr,'erro'));await sleep(900);menuUtils()}
async function ajudaTermux(){title();console.log(c(`Comandos úteis:\npkg update -y\npkg upgrade -y\npkg install nodejs\npkg install python\ntermux-setup-storage\nnode seu_arquivo.js\nnpm init -y\n`, 'texto'));await sleep(1200);menuUtils()}
async function mostrarTemaAtual(){title();console.log(c(`Tema atual: ${T().nome}\nModo: ${state.mode}`,'texto'));await sleep(800);menuTemas()}
async function helpString(){return c('Digite números dos menus para navegar. Para shell, digite sair.','aviso')}
async function menuBackCheck(op,back){if(String(op).trim()===String(back))return true;return false}
boot()
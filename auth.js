// Simple client-side login. Passwords are kept as salted SHA-256 hashes.
function sha256(s){
  const K=[],H=[];let p=0;const isP=n=>{for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
  const fr=x=>((x-Math.floor(x))*4294967296)|0;
  for(let c=2;p<64;c++)if(isP(c)){H[p]=fr(Math.pow(c,.5));K[p++]=fr(Math.pow(c,1/3));}
  const h=H.slice(0,8),b=unescape(encodeURIComponent(s)),w=[];let l=b.length*8;
  for(let i=0;i<b.length;i++)w[i>>2]|=b.charCodeAt(i)<<(24-(i%4)*8);
  w[l>>5]|=0x80<<(24-l%32);const n=(((l+64)>>9)<<4)+16;for(let i=0;i<n;i++)w[i]=w[i]|0;w[n-1]=l;
  for(let j=0;j<w.length;j+=16){
    const x=w.slice(j,j+16);let [a,b2,c,d,e,f,g,hh]=h;
    for(let i=0;i<64;i++){
      if(i>=16){const x15=x[i-15],x2=x[i-2];
        const s0=((x15>>>7)|(x15<<25))^((x15>>>18)|(x15<<14))^(x15>>>3);
        const s1=((x2>>>17)|(x2<<15))^((x2>>>19)|(x2<<13))^(x2>>>10);
        x[i]=(x[i-16]+s0+x[i-7]+s1)|0;}
      const S1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));
      const t1=(hh+S1+((e&f)^(~e&g))+K[i]+x[i])|0;
      const S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));
      const t2=(S0+((a&b2)^(a&c)^(b2&c)))|0;
      hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b2;b2=a;a=(t1+t2)|0;}
    h[0]=(h[0]+a)|0;h[1]=(h[1]+b2)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;}
  return h.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
}
const Auth=(()=>{
  const mem={};
  const get=k=>{try{return localStorage.getItem(k)}catch{return mem[k]??null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{mem[k]=v}};
  const sget=k=>{try{return sessionStorage.getItem(k)}catch{return mem['s'+k]??null}};
  const sset=(k,v)=>{try{v===null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch{mem['s'+k]=v}};
  let list=JSON.parse(get('att.accounts')||'null')||JSON.parse(JSON.stringify(SEED_ACCOUNTS));
  const save=()=>set('att.accounts',JSON.stringify(list));
  const hash=(salt,p)=>sha256(salt+':'+p);
  const AL='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const genPassword=()=>{const a=new Uint32Array(6);(crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*4e9));return 'MTSS-'+[...a].map(n=>AL[n%AL.length]).join('')};
  const salt=()=>Math.random().toString(16).slice(2,14);
  return {
    all:()=>list,
    login(u,p){
      const a=list.find(x=>x.u===String(u).trim().toLowerCase());
      if(!a||hash(a.salt,p)!==a.h)return null;
      const s={u:a.u,role:a.role,cls:a.cls||null,name:a.name};sset('att.session',JSON.stringify(s));return s;
    },
    session(){try{return JSON.parse(sget('att.session'))}catch{return null}},
    logout(){sset('att.session',null)},
    genPassword,
    setPassword(u,p,isReset){const a=list.find(x=>x.u===u);a.salt=salt();a.h=hash(a.salt,p);a.changed=!isReset;save()},
    needsChange(u){const a=list.find(x=>x.u===u);return !!a&&!a.changed},
    verify(u,p){const a=list.find(x=>x.u===u);return !!a&&hash(a.salt,p)===a.h},
    addTeacher(name){
      let n=1;while(list.some(x=>x.u===`teacher${String(n).padStart(2,'0')}`))n++;
      const u=`teacher${String(n).padStart(2,'0')}`,p=genPassword(),s=salt();
      list.push({u,role:'teacher',name,salt:s,h:hash(s,p),changed:false});save();return {u,p};
    },
    remove(u){list=list.filter(x=>x.u!==u);save()},
    reset(u){const p=genPassword();this.setPassword(u,p,true);return p}
  };
})();

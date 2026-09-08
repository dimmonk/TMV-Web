import{l as I,s as F}from"./site.Lt_qtYGu.js";import"./hoisted.D70Dt7xu.js";import"./index.Bel2lkwj.js";function ge(g,M){const q=M.waiverUrl,_=M.bookingUrl,V=M.address,G=M.accent??"#e27902";g.classList.add("reg-root"),g.style.setProperty("--acc",G),g.style.fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",g.style.color="#211f1b";const v={campWeekly:350,campDaily:90,camp2Days:170,camp3Days:240,camp4Days:300,campPADay:90,campPrivateDay:90,latePickupPerDay:20,latePickupBulk:75},Q=!0,O=["Mon","Tue","Wed","Thu","Fri"],T=[{id:"w1",n:"Week 1",dates:"Jun 29 – Jul 3",monday:"2026-06-29",days:["Mon","Tue","Thu","Fri"],partial:!0,month:"July",nums:{Mon:"29",Tue:"30",Thu:"2",Fri:"3"}},{id:"w2",n:"Week 2",dates:"Jul 6 – 10",monday:"2026-07-06",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"6",Tue:"7",Wed:"8",Thu:"9",Fri:"10"}},{id:"w3",n:"Week 3",dates:"Jul 13 – 17",monday:"2026-07-13",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"13",Tue:"14",Wed:"15",Thu:"16",Fri:"17"}},{id:"w4",n:"Week 4",dates:"Jul 20 – 24",monday:"2026-07-20",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"20",Tue:"21",Wed:"22",Thu:"23",Fri:"24"}},{id:"w5",n:"Week 5",dates:"Jul 27 – 31",monday:"2026-07-27",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"27",Tue:"28",Wed:"29",Thu:"30",Fri:"31"}},{id:"w6",n:"Week 6",dates:"Aug 4 – 7",monday:"2026-08-03",days:["Tue","Wed","Thu","Fri"],partial:!0,month:"August",nums:{Tue:"4",Wed:"5",Thu:"6",Fri:"7"}},{id:"w7",n:"Week 7",dates:"Aug 10 – 14",monday:"2026-08-10",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"10",Tue:"11",Wed:"12",Thu:"13",Fri:"14"}},{id:"w8",n:"Week 8",dates:"Aug 17 – 21",monday:"2026-08-17",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"17",Tue:"18",Wed:"19",Thu:"20",Fri:"21"}},{id:"w9",n:"Week 9",dates:"Aug 24 – 28",monday:"2026-08-24",days:["Mon","Tue","Wed","Thu","Fri"],nums:{Mon:"24",Tue:"25",Wed:"26",Thu:"27",Fri:"28"}}],E=[{id:"pa1",label:"Fri · Oct 10"},{id:"pa2",label:"Fri · Nov 21"},{id:"pa3",label:"Fri · Jan 16"}],X={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4},Z=(e,a)=>{const t=new Date(e.monday+"T00:00:00");return t.setDate(t.getDate()+X[a]),t},b=(e,a)=>{const t=Z(e,a);return t.setDate(t.getDate()+1),Date.now()>=t.getTime()},W=e=>e.days.filter(a=>!b(e,a)),R=e=>W(e).length===0,B=e=>{if(e<=0)return 0;const a=["campDaily","camp2Days","camp3Days","camp4Days","campWeekly"][Math.min(e,5)-1];return v[a]},ee=e=>B(W(e).length),H=e=>e<=0?0:e>=4?v.latePickupBulk:e*v.latePickupPerDay,N=e=>e.waiver==="yes"||e.waiver==="no"&&e.waiverDone,h=e=>"$"+e.toLocaleString("en-US"),l=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");let J=1;const L=e=>({id:e,name:"",age:"",allergies:"",notes:"",waiver:"unset",waiverDone:!1,camp:"weekly",weeks:{},paDates:{}}),s={stage:"build",kids:[L("k1")],expanded:"k1",parent:{name:"",email:"",phone:""},error:"",mSumOpen:!1,ref:""},U=e=>s.kids.find(a=>a.id===e);function w(e){const a=[];let t=0;return e.camp==="weekly"?T.forEach(r=>{const n=e.weeks[r.id];if(!n)return;const i=r.days.filter(p=>n.days[p]&&!b(r,p));if(i.length===0)return;const d=B(i.length),o=i.length===W(r).length?"full week":i.join(", ");a.push({title:r.n,dates:r.dates,days:o,amount:d}),t+=d;const c=i.filter(p=>n.late[p]);if(c.length>0){const p=H(c.length);a.push({title:"Late pickup",days:c.join(", "),amount:p,sub:!0}),t+=p}}):e.camp==="paday"&&E.forEach(r=>{const n=e.paDates[r.id];n&&(a.push({label:"P.A. Day · "+r.label,amount:v.campPADay}),t+=v.campPADay,n.late&&(a.push({label:"· late pickup to 4 PM",amount:v.latePickupPerDay,sub:!0}),t+=v.latePickupPerDay))}),{lines:a,total:t}}const j=()=>s.kids.reduce((e,a)=>e+w(a).total,0);function C(){return s.kids.map((e,a)=>({k:e,ki:a,comp:w(e)})).filter(e=>e.comp.lines.length>0).map(e=>({name:e.k.name.trim()||"Camper "+(e.ki+1),lines:e.comp.lines.map((a,t)=>({label:a.label,title:a.title,dates:a.dates,days:a.days,amount:h(a.amount),color:a.sub?"#9b9890":"#3a3833",mt:t===0?"0px":a.sub?"3px":"13px"}))}))}function z(e){const a=e.title?`<strong style="font-weight:800;">${l(e.title)}</strong>${e.dates?" · "+l(e.dates):""}`:l(e.label),t=e.days?`<div style="color:#9b9890; font-size:11.5px; margin-top:1px;">${l(e.days)}</div>`:"";return`<div style="font:600 12.5px/1.55 inherit; color:${e.color}; margin-top:${e.mt};">
      <div style="display:flex; justify-content:space-between; gap:12px;"><span>${a}</span><span style="white-space:nowrap;">${e.amount}</span></div>
      ${t}
    </div>`}function ae(){const e=C();return e.length===0?'<p style="font:500 13px/1.5 inherit; color:#9b9890; margin:0;">Pick a camp and some days to see your total here.</p>':'<div style="display:flex; flex-direction:column; gap:16px;">'+e.map(a=>`<div>
      <div style="font:800 12px/1 'Archivo',sans-serif; color:#a2601f; margin-bottom:8px; text-transform:uppercase; letter-spacing:.03em;">${l(a.name)}</div>
      ${a.lines.map(z).join("")}
    </div>`).join("")+"</div>"}function te(e,a){const t=w(e),r=s.expanded===e.id,n=e.camp==="private",i=(e.name.trim()[0]||a+1).toString().toUpperCase(),d=e.name.trim()||"Camper "+(a+1);let o;if(n)o="Private day · booked by appointment";else if(e.camp==="weekly"){const x=Object.keys(e.weeks).length;o=x?"Weekly Camp · "+x+" week"+(x>1?"s":""):"Weekly Camp — pick weeks"}else{const x=Object.keys(e.paDates).length;o=x?"P.A. Day · "+x+" day"+(x>1?"s":""):"P.A. Day — pick dates"}const c=n||t.total===0?"":h(t.total),p=r?"var(--acc)":"#eae7df",y=r?"#fffdf9":"#fff",D=s.kids.length>1?`<span class="reg-x" data-act="removeKid" data-kid="${e.id}" title="Remove" style="flex:none; width:28px; height:28px; border-radius:8px; background:#f3f2ee; color:#9b9890; display:flex; align-items:center; justify-content:center; font-size:13px;"><i class="bi bi-trash"></i></span>`:"",$=`<div class="reg-khead" data-act="toggleExpand" data-kid="${e.id}" style="display:flex; align-items:center; gap:12px; padding:14px 16px; background:${y};">
      <span style="flex:none; width:36px; height:36px; border-radius:10px; background:var(--acc); color:#fff; display:flex; align-items:center; justify-content:center; font:900 15px/1 'Archivo',sans-serif;">${l(i)}</span>
      <div style="flex:1; min-width:0;">
        <div style="font:800 15.5px/1.1 'Archivo',sans-serif;">${l(d)}</div>
        <div style="font:600 12px/1.3 inherit; color:#8a877f; margin-top:3px;">${l(o)}</div>
      </div>
      <span style="flex:none; font:900 16px/1 'Archivo',sans-serif; color:var(--acc);">${c}</span>
      ${D}
      <i class="bi ${r?"bi-chevron-up":"bi-chevron-down"}" style="flex:none; color:#b0aca3;"></i>
    </div>`;if(!r)return`<div style="background:#fff; border:1.5px solid ${p}; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.05),0 14px 30px -26px rgba(28,25,23,.4);">${$}</div>`;const A=`<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin:12px 0 9px;">Camp</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">${[["weekly","Weekly"],["paday","P.A. Day"],["private","Private Day"]].map(([x,S])=>e.camp===x?`<span class="reg-chip" data-act="setCamp" data-kid="${e.id}" data-camp="${x}" style="display:inline-flex; align-items:center; gap:7px; padding:10px 14px; border-radius:11px; border:1.5px solid var(--acc); background:#fff7ef; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill" style="color:var(--acc);"></i>${S}</span>`:`<span class="reg-chip" data-act="setCamp" data-kid="${e.id}" data-camp="${x}" style="display:inline-flex; align-items:center; padding:10px 14px; border-radius:11px; border:1.5px solid #e5e2db; background:#fff; font:700 13px/1 'Archivo',sans-serif; color:#5b5853;">${S}</span>`).join("")}</div>
    </div>`;let k="";e.camp==="weekly"?k=ne(e):e.camp==="paday"?k=re(e):k=oe();const m=n?"":de(e);return`<div style="background:#fff; border:1.5px solid ${p}; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.05),0 14px 30px -26px rgba(28,25,23,.4);">
      ${$}
      <div style="padding:6px 16px 18px; display:flex; flex-direction:column; gap:18px;">
        ${A}
        ${k}
        ${m}
      </div>
    </div>`}function ie(e,a,t){const r=t[0],n=a.nums[t]||"";if(a.days.indexOf(t)===-1)return`<span title="Holiday — no camp" style="width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#f3f2ee; border:1.5px solid #f3f2ee;"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; color:#c9c4b8;">${r}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; color:#c9c4b8; margin-top:3px;">–</span></span>`;if(b(a,t))return`<span title="This day has passed" style="width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#f3f2ee; border:1.5px solid #eae7df; cursor:not-allowed;"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; color:#c9c4b8;">${r}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; color:#c4c0b7; margin-top:3px; text-decoration:line-through;">${n}</span></span>`;const d=e.weeks[a.id],o=!!(d&&d.days[t]),c=o?"width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:var(--acc); border:1.5px solid var(--acc); color:#fff;":"width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#fff; border:1.5px solid #e0dcd3;",p=o?"opacity:.75;":"color:#b0aca3;",y=o?"":"color:#5b5853;";return`<span class="reg-pill" data-act="weekDay" data-kid="${e.id}" data-week="${a.id}" data-day="${t}" style="${c}"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; ${p}">${r}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; margin-top:3px; ${y}">${n}</span></span>`}function se(e,a){const t=R(a),r=e.weeks[a.id],n=r?a.days.filter(m=>r.days[m]&&!b(a,m)):[],i=n.length>0,d=i?"var(--acc)":"#ece9e2";let o,c;t?(o="Closed",c="#9b9890"):i?(o=h(w({...e,camp:"weekly",weeks:{[a.id]:r}}).total),c="var(--acc)"):(o=h(ee(a)),c="#9b9890");const p=a.partial?`<span style="flex:none; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.05em; text-transform:uppercase; color:#a2601f; background:#fff2e2; padding:4px 6px; border-radius:5px;">4-day</span>`:"",y=t?"reg-wklabel":"reg-pill reg-wklabel",D=t?"":`data-act="toggleWeek" data-kid="${e.id}" data-week="${a.id}"`,$=`<div class="${y}" ${D}>
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <div style="font:800 13px/1.1 'Archivo',sans-serif;">${a.n}</div>
        ${p}
      </div>
      <div class="reg-wkprice" style="font:800 12.5px/1 'Archivo',sans-serif; color:${c}; margin-top:6px;">${o}</div>
    </div>`,P=`<div class="reg-wkcells">${O.map(m=>ie(e,a,m)).join("")}</div>`;let A="";if(i&&!t){const m=n.filter(f=>r.late[f]).length,x=m>0?"+"+h(H(m))+(m>=4?" (capped)":""):"",S=O.map(f=>!!(r&&r.days[f])&&a.days.indexOf(f)!==-1&&!b(a,f)?!!r.late[f]?`<span class="reg-pill" data-act="weekLate" data-kid="${e.id}" data-week="${a.id}" data-day="${f}" style="width:40px; padding:8px 0; text-align:center; border-radius:8px; background:#211f1b; border:1.5px solid #211f1b; color:#ffd400; font:800 11px/1 'Archivo',sans-serif;">${f[0]}</span>`:`<span class="reg-pill" data-act="weekLate" data-kid="${e.id}" data-week="${a.id}" data-day="${f}" style="width:40px; padding:8px 0; text-align:center; border-radius:8px; background:#fff; border:1.5px solid #e0dcd3; color:#8a877f; font:800 11px/1 'Archivo',sans-serif;">${f[0]}</span>`:'<span style="width:40px; visibility:hidden;"></span>').join("");A=`<div class="reg-latrow">
        <div class="reg-wklabel">
          <div style="font:600 12px/1.4 inherit; color:#8a877f;">Late pickup to 4 PM</div>
          ${x?`<div class="reg-wkprice" style="font:800 11.5px/1 'Archivo',sans-serif; color:var(--acc); margin-top:4px;">${x}</div>`:""}
        </div>
        <div class="reg-wkcells">${S}</div>
      </div>`}return`${a.month?`<div style="display:flex; align-items:center; gap:10px; margin:5px 0 -1px;"><span style="font:800 11px/1 'Archivo',sans-serif; letter-spacing:.09em; text-transform:uppercase;">${a.month}</span><span style="flex:1; height:1px; background:#e8e5dd;"></span></div>`:""}<div style="border:1px solid ${d}; border-radius:12px; overflow:hidden;"><div class="reg-wkrow">${$}${P}</div>${A}</div>`}function ne(e){return`<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:6px;">Pick your days</div>
      <div style="font:600 12px/1.4 inherit; color:#a8a49b; margin-bottom:10px;">Tap days — or tap a week's name to take the whole week.</div>
      <div style="display:flex; flex-direction:column; gap:8px;">${T.map(t=>se(e,t)).join("")}</div>
    </div>`}function re(e){return`<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Pick P.A. Day dates · $90 each</div>
      <div style="display:flex; flex-direction:column; gap:8px;">${E.map(t=>{const r=e.paDates[t.id],n=!!r,i=n?"var(--acc)":"#ece9e2",d=n?'<span style="flex:none; width:20px; height:20px; border-radius:6px; background:var(--acc); display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#fff; font-size:13px;"></i></span>':'<span style="flex:none; width:20px; height:20px; border-radius:6px; border:1.5px solid #d5d1c8;"></span>',o=`<div class="reg-pill" data-act="togglePa" data-kid="${e.id}" data-pa="${t.id}" style="display:flex; align-items:center; gap:12px; padding:12px 13px;">
        ${d}
        <div style="flex:1;"><div style="font:800 13.5px/1.1 'Archivo',sans-serif;">${t.label}</div><div style="font:600 11.5px/1.3 inherit; color:#8a877f; margin-top:2px;">9 AM – 2 PM</div></div>
        <span style="flex:none; font:800 13.5px/1 'Archivo',sans-serif;">$90</span>
      </div>`;let c="";if(n&&Q){const y=!!r.late?'<span style="flex:none; width:18px; height:18px; border-radius:5px; background:#211f1b; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#ffd400; font-size:12px;"></i></span>':'<span style="flex:none; width:18px; height:18px; border-radius:5px; border:1.5px solid #d5d1c8;"></span>';c=`<div class="reg-pill" data-act="paLate" data-kid="${e.id}" data-pa="${t.id}" style="background:#fbf9f4; border-top:1px solid #efece4; padding:11px 13px; display:flex; align-items:center; gap:10px;">
          ${y}
          <span style="flex:1; font:600 12px/1.3 inherit; color:#5b5853;">Late pickup to 4 PM</span>
          <span style="font:800 12px/1 'Archivo',sans-serif; color:var(--acc);">+$20</span>
        </div>`}return`<div style="border:1px solid ${i}; border-radius:12px; overflow:hidden;">${o}${c}</div>`}).join("")}</div>
    </div>`}function oe(){return`<div style="border:1px solid #e8e5dd; background:#faf9f5; border-radius:12px; padding:16px 16px 18px;">
      <div style="display:flex; gap:13px; align-items:flex-start; margin-bottom:14px;">
        <span style="flex:none; width:38px; height:38px; border-radius:10px; background:#fff7ef; display:flex; align-items:center; justify-content:center;"><i class="bi bi-calendar2-week" style="color:var(--acc); font-size:17px;"></i></span>
        <div style="flex:1;">
          <div style="font:800 14.5px/1.15 'Archivo',sans-serif; margin-bottom:6px;">Private days are booked by appointment</div>
          <p style="font:400 13px/1.5 inherit; color:#5b5853; margin:0; text-wrap:pretty;">You pick your own date and we build the day around your group (5+ kids, $90 each). Reserve your date through our booking system — no need to fill out this form.</p>
        </div>
      </div>
      <a href="${_}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; text-decoration:none; background:#ffd400; color:#211f1b; font:800 13px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:13px 18px; border-radius:10px;">Book a private day <i class="bi bi-arrow-up-right"></i></a>
    </div>`}function de(e){const t=N(e)?"ok":e.waiver==="unset"?"neutral":"todo",r=t==="ok"?"#cfe6d6":t==="todo"?"#f0dcc2":"#e8e5dd",n=t==="ok"?"#f0f8f2":t==="todo"?"#fff7ef":"#faf9f5",i=e.waiver==="yes"?`<span class="reg-chip" data-act="waiver" data-kid="${e.id}" data-val="yes" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:10px; border:1.5px solid #1b6b2f; background:#eef7f0; color:#1b6b2f; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill"></i>Yes — on file</span>`:`<span class="reg-chip" data-act="waiver" data-kid="${e.id}" data-val="yes" style="flex:1; display:inline-flex; align-items:center; justify-content:center; padding:11px; border-radius:10px; border:1.5px solid #e0dcd3; background:#fff; color:#5b5853; font:700 13px/1 'Archivo',sans-serif;">Yes — done before</span>`,d=e.waiver==="no"?`<span class="reg-chip" data-act="waiver" data-kid="${e.id}" data-val="no" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:10px; border:1.5px solid var(--acc); background:#fff7ef; color:#a2601f; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill"></i>No — first time</span>`:`<span class="reg-chip" data-act="waiver" data-kid="${e.id}" data-val="no" style="flex:1; display:inline-flex; align-items:center; justify-content:center; padding:11px; border-radius:10px; border:1.5px solid #e0dcd3; background:#fff; color:#5b5853; font:700 13px/1 'Archivo',sans-serif;">No — first time</span>`;let o="";if(e.waiver==="no"){const c=e.waiverDone?`<span style="flex:none; width:20px; height:20px; border-radius:6px; background:#1b6b2f; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#fff; font-size:13px;"></i></span><span style="font:700 12.5px/1.2 'Archivo',sans-serif; color:#1b6b2f;">Waiver submitted — all set</span>`:`<span style="flex:none; width:20px; height:20px; border-radius:6px; border:2px solid #d5b48a;"></span><span style="font:700 12.5px/1.2 'Archivo',sans-serif; color:#a2601f;">I've completed the waiver</span>`;o=`<div style="margin-top:12px; padding-top:12px; border-top:1px dashed #e6dcc8;">
        <div style="font:700 12.5px/1.35 'Archivo',sans-serif; color:#a2601f; margin-bottom:9px;">Step 2 — sign the one-time waiver, then confirm it's done.</div>
        <a href="${q}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#ffd400; color:#211f1b; font:800 12.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:11px 15px; border-radius:9px; margin-bottom:10px;"><i class="bi bi-pencil-square"></i>Please sign the waiver here</a>
        <div class="reg-pill" data-act="waiverDone" data-kid="${e.id}" style="display:flex; align-items:center; gap:9px;">${c}</div>
      </div>`}return`<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Camper details</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; gap:10px;">
          <input class="reg-in" style="flex:2;" type="text" placeholder="Camper's name" value="${l(e.name)}" data-field="${e.id}.name">
          <input class="reg-in" style="flex:1;" type="number" min="5" max="17" inputmode="numeric" placeholder="Age (5+)" value="${l(e.age)}" data-field="${e.id}.age">
        </div>
        <input class="reg-in" type="text" placeholder="Allergies we should know about" value="${l(e.allergies)}" data-field="${e.id}.allergies">
        <textarea class="reg-in" placeholder="Anything the coaches should know? (optional)" data-field="${e.id}.notes">${l(e.notes)}</textarea>
        <div style="border:1px solid ${r}; background:${n}; border-radius:11px; padding:13px 14px;">
          <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Waiver</div>
          <div style="font:700 13px/1.35 'Archivo',sans-serif; margin-bottom:11px;">Step 1 — has this camper filled out a Monkey Vault waiver before?</div>
          <div style="display:flex; gap:8px;">${i}${d}</div>
          ${o}
        </div>
      </div>
    </div>`}function le(){const e=s.kids.map((f,Y)=>te(f,Y)).join(""),a=j(),t=h(a),r=a>0?"Register & pay "+t:"Register & pay",n=s.kids.filter(f=>f.camp!=="private"&&w(f).total>0&&f.waiver==="no"&&!f.waiverDone),i=n.length>0,d=i?"Waiver still needed for "+n.map(f=>f.name.trim()||"camper "+(s.kids.indexOf(f)+1)).join(", ")+".":"",o=s.kids[0],c=!!o&&o.camp!=="private"&&(Object.keys(o.weeks).length>0||Object.keys(o.paDates).length>0),p=o&&o.name.trim()||"Camper 1",y=c?`<div class="reg-cta" data-act="addSibling" style="flex:1; min-width:180px; border:1.5px dashed #e6c98f; border-radius:14px; padding:15px; text-align:center; font:800 13.5px/1 'Archivo',sans-serif; color:#a2601f; background:#fffdf9;"><i class="bi bi-people"></i>&nbsp; Add a sibling — same days as ${l(p)}</div>`:"",D=i?`<div style="display:flex; align-items:flex-start; gap:8px; font:600 11.5px/1.4 inherit; color:#a2601f; background:#fff7ef; border:1px solid #f0dcc2; border-radius:9px; padding:9px 11px; margin-top:14px;"><i class="bi bi-exclamation-triangle-fill" style="margin-top:1px;"></i><span>${l(d)}</span></div>`:"",$=s.error?`<div style="font:600 11.5px/1.4 inherit; color:#b3261e; background:#fdecea; border-radius:9px; padding:9px 11px; margin-top:14px;">${l(s.error)}</div>`:"",P=s.kids.length,A=P+" camper"+(P>1?"s":""),k=s.mSumOpen?`<div style="width:100%; max-height:270px; overflow-y:auto; padding:16px 18px 6px; border-bottom:1px solid rgba(255,255,255,.12);">
      ${pe()}
      <div style="font:500 10.5px/1.4 inherit; color:rgba(255,255,255,.5); padding-bottom:8px;">HST included. Cancel any week up to two weeks before it starts for a full refund, minus a $20 fee — less notice, 15% retained.</div>
    </div>`:"",m=s.mSumOpen?"bi-chevron-down":"bi-chevron-up",x=s.error||i?`<div class="reg-mnotice" data-noprint style="padding:0 16px 10px;">
      ${s.error?`<div style="font:600 12px/1.4 inherit; color:#b3261e; background:#fdecea; border-radius:9px; padding:10px 12px;">${l(s.error)}</div>`:""}
      ${!s.error&&i?`<div style="display:flex; align-items:flex-start; gap:8px; font:600 12px/1.4 inherit; color:#a2601f; background:#fff7ef; border:1px solid #f0dcc2; border-radius:9px; padding:10px 12px;"><i class="bi bi-exclamation-triangle-fill" style="margin-top:1px;"></i><span>${l(d)}</span></div>`:""}
    </div>`:"";return`<div>
      
      <div class="reg-wrap" style="max-width:1140px; margin:0 auto; padding:26px 16px 60px;">
        <div class="reg-grid">
          <div>
            <div style="font:700 11px/1 'Archivo',sans-serif; letter-spacing:.13em; text-transform:uppercase; color:#9b9890; margin-bottom:14px;">Who's registering</div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              ${e}
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <div class="reg-cta" data-act="addKid" style="flex:1; min-width:180px; border:1.5px dashed #d5d1c8; border-radius:14px; padding:15px; text-align:center; font:800 13.5px/1 'Archivo',sans-serif; color:#8a877f; background:#fff;"><i class="bi bi-plus-lg"></i>&nbsp; Add another child</div>
                ${y}
              </div>
              <div style="background:#fff; border:1px solid #e8e5dd; border-radius:16px; padding:18px 18px 20px; box-shadow:0 1px 3px rgba(28,25,23,.05);">
                <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:12px;">Parent / guardian</div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <input class="reg-in" type="text" placeholder="Your name" value="${l(s.parent.name)}" data-field="parent.name">
                  <div style="display:flex; gap:10px;">
                    <input class="reg-in" style="flex:1;" type="email" placeholder="Email" value="${l(s.parent.email)}" data-field="parent.email">
                    <input class="reg-in" style="flex:1;" type="tel" placeholder="Phone" value="${l(s.parent.phone)}" data-field="parent.phone">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="reg-side">
            <div style="background:#fff; border:1px solid #e3e0d8; border-radius:18px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.06),0 24px 50px -40px rgba(28,25,23,.5);">
              <div style="background:#211f1b; color:#fff; padding:16px 20px;">
                <div style="font:700 10px/1 'Archivo',sans-serif; letter-spacing:.12em; text-transform:uppercase; color:var(--acc);">Your registration</div>
              </div>
              <div style="padding:18px 20px;">
                ${ae()}
                <div style="margin-top:18px; padding-top:16px; border-top:1px solid #ece9e2;">
                  <div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font:800 15px/1 'Archivo',sans-serif;">Total</span><span style="font:900 26px/1 'Archivo',sans-serif; color:var(--acc);">${t}</span></div>
                  <div style="font:500 11px/1.4 inherit; color:#9b9890; margin-top:5px;">HST included</div>
                </div>
                ${D}
                ${$}
                <div class="reg-cta" data-act="register" style="margin-top:16px; text-align:center; padding:15px; border-radius:12px; background:#ffd400; color:#211f1b; font:800 14.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em;">${r}</div>
                <div style="display:flex; align-items:center; justify-content:center; gap:6px; font:600 10.5px/1.3 inherit; color:#b0aca3; margin-top:10px;"><i class="bi bi-lock-fill"></i>Secure checkout by Square</div>
                <div style="margin-top:14px; padding-top:12px; border-top:1px solid #ece9e2; font:500 11px/1.55 inherit; color:#9b9890; text-wrap:pretty;"><strong style="font-weight:700; color:#7a7770;">Plans change?</strong> Cancel any week up to two weeks before it starts for a full refund, minus a $20 processing fee. With less notice, 15% is retained.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="reg-mbar" data-noprint style="flex-direction:column; background:#211f1b; color:#fff; box-shadow:0 -8px 24px -12px rgba(0,0,0,.5);">
        ${k}
        <div style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px;">
          <div class="reg-pill" data-act="toggleMSum">
            <div style="display:flex; align-items:center; gap:6px; font:600 10.5px/1 inherit; color:rgba(255,255,255,.55); margin-bottom:5px;">${A} <i class="bi ${m}" style="font-size:10px;"></i></div>
            <div style="font:900 21px/1 'Archivo',sans-serif; color:var(--acc);">${t}</div>
          </div>
          <span class="reg-cta" data-act="register" style="display:inline-flex; align-items:center; gap:9px; padding:13px 20px; border-radius:11px; background:#ffd400; color:#211f1b; font:800 13.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em;">Register <i class="bi bi-arrow-right"></i></span>
        </div>
      </div>
      ${x}
    </div>`}function pe(){const e=C();return e.length===0?'<div style="font:500 12px/1.5 inherit; color:rgba(255,255,255,.55); margin-bottom:10px;">Pick a camp and some days to see the breakdown here.</div>':e.map(a=>`<div style="margin-bottom:12px;">
      <div style="font:800 11.5px/1 'Archivo',sans-serif; color:#ffd400; text-transform:uppercase; letter-spacing:.03em; margin-bottom:7px;">${l(a.name)}</div>
      ${a.lines.map(t=>{const r=t.title?`<strong style="font-weight:800;">${l(t.title)}</strong>${t.days?" · "+l(t.days):""}`:l(t.label);return`<div style="display:flex; justify-content:space-between; gap:12px; font:600 12px/1.5 inherit; color:rgba(255,255,255,.8); margin-top:${t.mt};"><span>${r}</span><span style="white-space:nowrap;">${t.amount}</span></div>`}).join("")}
    </div>`).join("")}const ce=[{icon:"bi-clipboard-check",title:"Before camp",items:["Sign the one-time waiver for any first-time camper — it must be done before day 1.","Pack a lunch and snacks (please avoid nuts), a labelled water bottle, clean indoor running shoes, and comfy clothes to move in. Label everything."]},{icon:"bi-sun",title:"The day of camp",items:["Doors open at 8:45 AM for arrival. Camp runs 9:00 AM – 2:00 PM.","On day one, arrive a few minutes early so we can check your camper in."]},{icon:"bi-box-arrow-in-right",title:"Check-in & check-out",items:["Check in at the front desk — a parent/guardian signs each camper in and out.","Standard pickup is 2:00 PM; late pickup (where purchased) runs until 4:00 PM.","Running late, or need late pickup added last-minute? Call us — we’ll keep your camper until you arrive.","Let us know in advance who else is authorized to pick up your child."]},{icon:"bi-shield-check",title:"Allergies & safety",items:["Please avoid packing nuts, and tell the coaches about any allergies at drop-off.","Cancellations need two weeks’ written notice (15% deposit retained for late notice; otherwise a $20 transaction fee)."]}];function fe(){const e=h(j()),a=s.parent.email||"your email",r=C().map(i=>`<div style="margin-bottom:14px;">
      <div style="font:800 13px/1 'Archivo',sans-serif; margin-bottom:7px;">${l(i.name)}</div>
      ${i.lines.map(z).join("")}
    </div>`).join(""),n=ce.map(i=>{const d=i.items.map(o=>`<div style="font:400 13px/1.5 inherit; color:#5b5853; text-wrap:pretty;">${l(o)}</div>`).join("");return`<div style="display:flex; gap:13px;">
        <span style="flex:none; width:38px; height:38px; border-radius:10px; background:#fff7ef; display:flex; align-items:center; justify-content:center;"><i class="bi ${i.icon}" style="color:var(--acc); font-size:17px;"></i></span>
        <div style="flex:1;">
          <div style="font:800 14px/1.15 'Archivo',sans-serif; margin-bottom:6px;">${i.title}</div>
          <div style="display:flex; flex-direction:column; gap:5px;">${d}</div>
        </div>
      </div>`}).join("");return`<div style="max-width:820px; margin:0 auto; padding:36px 16px 80px;">
      <div class="reg-doc" style="background:#fff; border:1px solid #e3e0d8; border-radius:20px; padding:34px 38px 40px; box-shadow:0 1px 3px rgba(28,25,23,.06),0 30px 60px -46px rgba(28,25,23,.5);">
        <div class="reg-doc-inner" style="max-width:640px; margin:0 auto;">
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:22px;">
            <span style="flex:none; width:52px; height:52px; border-radius:14px; background:#e6f4ea; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#1b6b2f; font-size:28px;"></i></span>
            <div>
              <h1 style="font:900 26px/1.02 'Archivo',sans-serif; letter-spacing:-.015em; margin:0 0 4px;">You're registered!</h1>
              <p style="font:500 13.5px/1.4 inherit; color:#7a7770; margin:0;">Confirmation sent to ${l(a)} · ${l(s.ref)}</p>
            </div>
          </div>

          <div style="border:1px solid #ece9e2; border-radius:14px; overflow:hidden; margin-bottom:26px;">
            <div style="background:#faf9f5; padding:13px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ece9e2;">
              <span style="font:800 12px/1 'Archivo',sans-serif; letter-spacing:.04em; text-transform:uppercase; color:#211f1b;">Registration summary</span>
              <span style="font:700 11px/1 'Archivo',sans-serif; color:#9b9890;">Paid in full</span>
            </div>
            <div style="padding:16px 18px;">
              ${r}
              <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:13px; border-top:1px solid #ece9e2;"><span style="font:800 14px/1 'Archivo',sans-serif;">Total paid</span><span style="font:900 20px/1 'Archivo',sans-serif; color:var(--acc);">${e}</span></div>
            </div>
          </div>

          <div style="font:700 11px/1 'Archivo',sans-serif; letter-spacing:.12em; text-transform:uppercase; color:#9b9890; margin-bottom:14px;">What to know before camp</div>
          <div style="display:flex; flex-direction:column; gap:16px;">${n}</div>

          <div style="margin-top:22px; padding-top:18px; border-top:1px solid #efece4; font:400 12px/1.5 inherit; color:#9b9890; text-wrap:pretty;">${l(V)} · Questions? Reply to your confirmation email or call the front desk.</div>

          <div data-noprint style="display:flex; flex-wrap:wrap; gap:10px; margin-top:24px;">
            <span class="reg-cta" data-act="download" style="display:inline-flex; align-items:center; gap:9px; background:#211f1b; color:#fff; font:800 13px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:14px 20px; border-radius:11px;"><i class="bi bi-download"></i>Download PDF summary</span>
            <span class="reg-cta" data-act="edit" style="display:inline-flex; align-items:center; gap:9px; background:transparent; color:#211f1b; font:700 13px/1 'Archivo',sans-serif; padding:14px 18px; border-radius:11px; border:1.5px solid #ddd9d0;">Register another camper</span>
          </div>
        </div>
      </div>
    </div>`}function u(){const e=document.activeElement,a=e&&e.dataset?e.dataset.field:null;let t=null;if(a)try{t=e.selectionStart}catch{t=null}if(g.innerHTML=s.stage==="build"?le():fe(),a){const r=g.querySelector(`[data-field="${a}"]`);if(r&&(r.focus(),t!=null))try{r.setSelectionRange(t,t)}catch{}}}function K(){try{let e=g;for(;e;)e.scrollTop>0&&(e.scrollTop=0),e=e.parentElement;window.scrollTo(0,0)}catch{}}function xe(){const{kids:e,parent:a}=s;if(j()<=0){s.error="Add at least one camp day. Private days are booked separately with the button in the card.",u();return}if(!a.name.trim()||!a.email.trim()){s.error="Please add the parent/guardian name and email.",u();return}for(const t of e)if(t.camp!=="private"){if(w(t).total<=0){s.error="Every camper needs at least one day (or remove them / switch to a private booking).",u();return}if(!t.name.trim()){s.error="Please name each camper.",u();return}if(t.age!==""&&Number(t.age)<5){s.error="Camps are for ages 5 and up — check "+(t.name.trim()||"your camper")+"’s age.",u();return}if(!N(t)){s.error="Waiver still needed for "+(t.name.trim()||"a camper")+" — answer Step 1 and complete it.",u();return}}s.ref="TMV-"+Math.random().toString(36).slice(2,7).toUpperCase(),s.stage="confirm",s.error="",s.mSumOpen=!1,u(),K()}g.addEventListener("click",e=>{const a=e.target.closest("[data-act]");if(!a||!g.contains(a))return;const t=a.dataset.act,r=a.dataset.kid,n=r?U(r):null;switch(t!=="toggleMSum"&&(s.error=""),t){case"addKid":{const i="k"+ ++J;s.kids=[...s.kids,L(i)],s.expanded=i;break}case"addSibling":{const i=s.kids[0];if(!i)break;const d="k"+ ++J,o=L(d);o.camp=i.camp,o.weeks=JSON.parse(JSON.stringify(i.weeks)),o.paDates=JSON.parse(JSON.stringify(i.paDates)),s.kids=[...s.kids,o],s.expanded=d;break}case"removeKid":{e.stopPropagation(),s.kids=s.kids.filter(i=>i.id!==r),s.expanded===r&&(s.expanded=s.kids[0]?s.kids[0].id:null);break}case"toggleExpand":s.expanded=s.expanded===r?null:r??null;break;case"setCamp":n&&(n.camp=a.dataset.camp);break;case"toggleWeek":{if(!n)break;const i=T.find(p=>p.id===a.dataset.week);if(R(i))break;const d=n.weeks[i.id],o=W(i);if(d&&o.length>0&&o.every(p=>d.days[p]))delete n.weeks[i.id];else{const p={};o.forEach(y=>{p[y]=!0}),n.weeks[i.id]={days:p,late:d&&d.late||{}}}break}case"weekDay":{const i=T.find(p=>p.id===a.dataset.week),d=a.dataset.day;if(!n||b(i,d))break;const o=n.weeks[i.id],c=o?{days:{...o.days},late:{...o.late}}:{days:{},late:{}};c.days[d]=!c.days[d],i.days.some(p=>c.days[p])?n.weeks[i.id]=c:delete n.weeks[i.id];break}case"weekLate":{const i=T.find(c=>c.id===a.dataset.week),d=a.dataset.day,o=n&&n.weeks[a.dataset.week];o&&!b(i,d)&&(o.late[d]=!o.late[d]);break}case"togglePa":{if(!n)break;const i=a.dataset.pa;n.paDates[i]?delete n.paDates[i]:n.paDates[i]={late:!1};break}case"paLate":{const i=n&&n.paDates[a.dataset.pa];i&&(i.late=!i.late);break}case"waiver":n&&(n.waiver=a.dataset.val);break;case"waiverDone":n&&(n.waiverDone=!n.waiverDone);break;case"toggleMSum":s.mSumOpen=!s.mSumOpen;break;case"register":xe();return;case"edit":s.stage="build",u(),K();return;case"download":try{window.print()}catch{}return}u()}),g.addEventListener("input",e=>{const a=e.target.closest("[data-field]");if(!a)return;const t=a.dataset.field,r=a.value;if(s.error="",t.startsWith("parent."))s.parent[t.split(".")[1]]=r;else{const[n,i]=t.split("."),d=U(n);d&&(d[i]=r)}u()}),u()}document.addEventListener("astro:page-load",()=>{const g=document.getElementById("reg-root");!g||g.dataset.mounted||(g.dataset.mounted="1",ge(g,{waiverUrl:I.waiver,bookingUrl:I.booking,address:`${F.name} · ${F.address.street}, ${F.address.locality} (Downsview Park)`}))});

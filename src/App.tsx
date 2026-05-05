import { useState, useEffect, useRef } from "react";

// Design Tokens
const t = {
  bg:          "#08080d",
  bgAlt:       "#0d0d14",
  surface:     "#11111a",
  surfaceHigh: "#181824",
  border:      "#1e1e2e",
  borderLight: "#252538",
  accent:      "#e8c547",
  accentDim:   "rgba(232,197,71,0.10)",
  accentGlow:  "rgba(232,197,71,0.20)",
  text:        "#f0ede6",
  sub:         "#9996a8",
  muted:       "#55536a",
  success:     "#4ade80",
  successDim:  "rgba(74,222,128,0.12)",
  warn:        "#fb923c",
  warnDim:     "rgba(251,146,60,0.12)",
  info:        "#60a5fa",
  infoDim:     "rgba(96,165,250,0.12)",
  danger:      "#f87171",
};

const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";

// Mock Data
const MOCK_PROJECTS = [
  { id:"p1", client:"Martinez Family",    county:"Denver",    fenceType:"wood_privacy", linearFeet:180, heightFt:6, materialCost:2840, laborCost:1620, totalCost:4460,  depositRate:0.45, depositPaid:2007, finalPrice:5750,  status:"paid",    createdAt:"2025-01-08", paidAt:"2025-01-22", adjustments:[], notes:"Double gate on north side." },
  { id:"p2", client:"High Plains Ranch",  county:"Weld",      fenceType:"split_rail",   linearFeet:640, heightFt:4, materialCost:5120, laborCost:3840, totalCost:8960,  depositRate:0.50, depositPaid:4800, finalPrice:9600,  status:"active",  createdAt:"2025-02-03", paidAt:null,         adjustments:[{label:"Added 80ft west run",amount:480}], notes:"Access gate at mile marker 2." },
  { id:"p3", client:"Kowalski Residence", county:"Jefferson", fenceType:"vinyl",        linearFeet:95,  heightFt:6, materialCost:3420, laborCost:855,  totalCost:4275,  depositRate:0.40, depositPaid:1900, finalPrice:4750,  status:"active",  createdAt:"2025-02-14", paidAt:null,         adjustments:[], notes:"HOA requires white vinyl only." },
  { id:"p4", client:"Summit Ridge HOA",   county:"Summit",    fenceType:"ornamental",   linearFeet:320, heightFt:4, materialCost:9600, laborCost:3840, totalCost:13440, depositRate:0.50, depositPaid:7500, finalPrice:15000, status:"pending", createdAt:"2025-02-19", paidAt:null,         adjustments:[], notes:"Estimate sent, awaiting signature." },
  { id:"p5", client:"Chen Property LLC",  county:"Boulder",   fenceType:"chain_link",   linearFeet:210, heightFt:5, materialCost:2940, laborCost:1512, totalCost:4452,  depositRate:0.45, depositPaid:2250, finalPrice:5000,  status:"paid",    createdAt:"2024-12-11", paidAt:"2024-12-29", adjustments:[{label:"Added corner bracing",amount:180}], notes:"" },
  { id:"p6", client:"Teller County Farm", county:"Teller",    fenceType:"split_rail",   linearFeet:880, heightFt:3, materialCost:6160, laborCost:4224, totalCost:10384, depositRate:0.50, depositPaid:5500, finalPrice:11000, status:"paid",    createdAt:"2024-11-02", paidAt:"2024-11-30", adjustments:[], notes:"3-rail. Livestock grade." },
  { id:"p7", client:"Vasquez New Build",  county:"Adams",     fenceType:"wood_picket",  linearFeet:120, heightFt:4, materialCost:1080, laborCost:1008, totalCost:2088,  depositRate:0.40, depositPaid:900,  finalPrice:2250,  status:"pending", createdAt:"2025-02-20", paidAt:null,         adjustments:[], notes:"Awaiting HOA approval." },
];

const CO_COUNTIES = ["Adams","Arapahoe","Boulder","Broomfield","Denver","Douglas","El Paso","Elbert","Garfield","Jefferson","Larimer","Mesa","Pitkin","Pueblo","Summit","Teller","Weld","Eagle","Fremont","Montrose"];

const FENCE_TYPES = [
  { id:"wood_privacy", label:"Wood Privacy", icon:"🪵",  desc:"6ft cedar boards, solid panels" },
  { id:"split_rail",   label:"Split Rail",   icon:"🌲",  desc:"Rustic 2-3 rail pine" },
  { id:"chain_link",   label:"Chain Link",   icon:"⛓️",  desc:"Galvanized steel mesh" },
  { id:"vinyl",        label:"Vinyl",        icon:"🏠",  desc:"PVC panels, low maintenance" },
  { id:"wood_picket",  label:"Wood Picket",  icon:"🏡",  desc:"Classic 4ft painted picket" },
  { id:"ornamental",   label:"Ornamental",   icon:"⚜️",  desc:"Decorative steel/aluminum" },
];

const MOCK_PRICES = {
  wood_privacy:{ "4x4x8 Post":14.97,"2x4x8 Rail":7.48,"1x6x6 Board":4.23,"80lb Concrete":5.48 },
  split_rail:  { "4x4x8 Post":14.97,"Split Rail 8ft":9.99,"80lb Concrete":5.48 },
  chain_link:  { "Line Post":18.47,"Chain Link 50ft":89.00,"Tension Wire":12.99 },
  vinyl:       { "Vinyl Post":28.99,"Vinyl Panel 6ft":64.99,"Post Cap":3.99 },
  wood_picket: { "4x4x8 Post":14.97,"2x4x8 Rail":7.48,"Picket 4ft":1.49,"80lb Concrete":5.48 },
  ornamental:  { "Orn Post":42.99,"Orn Panel 4ft":89.99,"80lb Concrete":5.48 },
};

const COUNTY_RATES = {
  Denver:{low:28,high:45},Boulder:{low:32,high:52},Jefferson:{low:26,high:42},
  Arapahoe:{low:25,high:40},"El Paso":{low:22,high:36},Summit:{low:38,high:62},
  Eagle:{low:40,high:66},Weld:{low:20,high:34},default:{low:24,high:38},
};

const STATUS_META = {
  paid:    { label:"Paid",      color: t.success, dim: t.successDim },
  active:  { label:"Active",    color: t.warn,    dim: t.warnDim },
  pending: { label:"Est. Sent", color: t.info,    dim: t.infoDim },
};

// Helpers
const fmt = n => n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const fmtD = s => new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fenceLabel = id => FENCE_TYPES.find(f=>f.id===id)?.label ?? id;

function calcQuote({fenceType,linearFeet,heightFt,employees,hourlyWage}) {
  const prices = MOCK_PRICES[fenceType] || MOCK_PRICES.wood_privacy;
  const sections = Math.ceil(linearFeet/8);
  let mat = 0, breakdown = [];
  if(fenceType==="wood_privacy"){
    const posts=sections+1,rails=sections*2,boards=sections*11,conc=posts;
    mat=posts*prices["4x4x8 Post"]+rails*prices["2x4x8 Rail"]+boards*prices["1x6x6 Board"]+conc*prices["80lb Concrete"];
    breakdown=[{item:"4x4x8 Posts",qty:posts,unit:prices["4x4x8 Post"]},{item:"2x4x8 Rails",qty:rails,unit:prices["2x4x8 Rail"]},{item:"1x6x6 Boards",qty:boards,unit:prices["1x6x6 Board"]},{item:"Concrete bags",qty:conc,unit:prices["80lb Concrete"]}];
  } else {
    Object.entries(prices).forEach(([item,price])=>{const qty=Math.ceil(sections*1.2);mat+=qty*price;breakdown.push({item,qty,unit:price});});
  }
  const hrs = sections*(fenceType==="wood_privacy"?1.5:1.2);
  const labor = hrs*employees*hourlyWage;
  const market = COUNTY_RATES[linearFeet>200?"Denver":"default"];
  return {materialCost:mat,laborCost:labor,totalCost:mat+labor,breakdown,totalHours:hrs,sections,marketLow:market.low*linearFeet,marketHigh:market.high*linearFeet};
}

// Shared UI Atoms
function StatusBadge({status}){
  const m = STATUS_META[status]||STATUS_META.pending;
  return <span style={{background:m.dim,border:`1px solid ${m.color}33`,color:m.color,fontSize:11,fontFamily:mono,padding:"3px 8px",borderRadius:6,letterSpacing:"0.08em"}}>{m.label}</span>;
}

function Pill({children,active,onClick}){
  return <button onClick={onClick} style={{background:active?t.accentDim:"transparent",border:`1px solid ${active?t.accent:t.border}`,color:active?t.accent:t.sub,borderRadius:8,padding:"7px 16px",fontSize:13,fontFamily:sans,cursor:"pointer",transition:"all 0.15s"}}>{children}</button>;
}

function HoverBtn({children,onClick,primary,style={}}){
  const [h,setH]=useState(false);
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:primary?(h?t.accent:t.accentDim):(h?t.surfaceHigh:"transparent"),border:`1px solid ${primary?t.accent:t.border}`,color:primary?(h?t.bg:t.accent):t.sub,borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:600,fontFamily:sans,cursor:"pointer",transition:"all 0.15s",...style}}>{children}</button>;
}

function Card({children,style={}}){
  return <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:"20px 22px",...style}}>{children}</div>;
}

function Label({children}){
  return <div style={{color:t.muted,fontSize:10,fontFamily:mono,letterSpacing:"0.12em",marginBottom:6,textTransform:"uppercase"}}>{children}</div>;
}

// Donut Chart
function DonutChart({segments,size=160,stroke=18}){
  const r = (size-stroke)/2;
  const circ = 2*Math.PI*r;
  const total = segments.reduce((s,g)=>s+g.value,0)||1;
  let offset = 0;
  const arcs = segments.map(seg=>{
    const dash = (seg.value/total)*circ;
    const gap  = circ-dash;
    const arc  = {dash,gap,offset,color:seg.color,label:seg.label,value:seg.value};
    offset += dash;
    return arc;
  });
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.border} strokeWidth={stroke}/>
      {arcs.map((a,i)=>(
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset}
          strokeLinecap="round" style={{transition:"stroke-dasharray 0.8s ease"}}/>
      ))}
    </svg>
  );
}

// SCREEN: DASHBOARD
function Dashboard({projects,onProjectClick,onNewEstimate}){
  const [tableExpanded,setTableExpanded]=useState(false);

  const ytd = projects.filter(p=>{
    const y=new Date(p.createdAt).getFullYear();
    return y===new Date().getFullYear();
  });

  const totalRevenue   = ytd.reduce((s,p)=>s+(p.status==="paid"?p.finalPrice:0),0);
  const activeRevenue  = ytd.filter(p=>p.status==="active").reduce((s,p)=>s+p.finalPrice,0);
  const pendingRevenue = ytd.filter(p=>p.status==="pending").reduce((s,p)=>s+p.finalPrice,0);
  const depositsPaid   = ytd.reduce((s,p)=>s+(p.depositPaid||0),0);
  const adjustmentsTotal= ytd.reduce((s,p)=>s+p.adjustments.reduce((a,j)=>a+j.amount,0),0);

  const paidCount    = ytd.filter(p=>p.status==="paid").length;
  const activeCount  = ytd.filter(p=>p.status==="active").length;
  const pendingCount = ytd.filter(p=>p.status==="pending").length;

  const donutSegs = [
    {label:"Paid",    value:totalRevenue,   color:t.success},
    {label:"Active",  value:activeRevenue,  color:t.warn},
    {label:"Pending", value:pendingRevenue, color:t.info},
  ];

  const totalDonut = totalRevenue+activeRevenue+pendingRevenue||1;
  const displayProjects = tableExpanded ? ytd : ytd.slice(0,4);

  return (
    <div style={{padding:"0 0 40px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28}}>
        <div>
          <div style={{color:t.muted,fontSize:11,fontFamily:mono,letterSpacing:"0.12em",marginBottom:4}}>GOOD MORNING</div>
          <h1 style={{color:t.text,fontSize:28,fontWeight:700,letterSpacing:"-0.02em",fontFamily:sans}}>Rocky Mtn Fence Co.</h1>
        </div>
        <HoverBtn primary onClick={onNewEstimate}>+ New Estimate</HoverBtn>
      </div>

      {/* Top row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:16,marginBottom:16}}>

        {/* Donut */}
        <Card>
          <Label>Account Overview</Label>
          <div style={{display:"flex",alignItems:"center",gap:20,marginTop:8}}>
            <div style={{position:"relative",flexShrink:0}}>
              <DonutChart segments={donutSegs} size={140} stroke={16}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{color:t.text,fontSize:16,fontWeight:700,fontFamily:mono}}>{ytd.length}</div>
                <div style={{color:t.muted,fontSize:9,fontFamily:mono,letterSpacing:"0.1em"}}>JOBS</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12,flex:1}}>
              {[
                {label:"Paid",    color:t.success, count:paidCount,    rev:totalRevenue},
                {label:"Active",  color:t.warn,    count:activeCount,  rev:activeRevenue},
                {label:"Pending", color:t.info,    count:pendingCount, rev:pendingRevenue},
              ].map(s=>(
                <div key={s.label}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
                      <span style={{color:t.sub,fontSize:12,fontFamily:sans}}>{s.label} ({s.count})</span>
                    </div>
                    <span style={{color:s.color,fontSize:12,fontFamily:mono}}>{fmt(s.rev)}</span>
                  </div>
                  <div style={{height:3,borderRadius:2,background:t.border}}>
                    <div style={{height:"100%",borderRadius:2,background:s.color,width:`${(s.rev/totalDonut)*100}%`,transition:"width 0.8s ease"}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* YTD Revenue */}
        <Card>
          <Label>Revenue YTD - {new Date().getFullYear()}</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
            {[
              {label:"Collected",   value:totalRevenue+depositsPaid, color:t.success},
              {label:"Outstanding", value:activeRevenue+pendingRevenue-depositsPaid, color:t.warn},
              {label:"Deposits In", value:depositsPaid,    color:t.info},
              {label:"Adjustments", value:adjustmentsTotal, color:t.accent},
            ].map(s=>(
              <div key={s.label} style={{background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{color:t.muted,fontSize:9,fontFamily:mono,letterSpacing:"0.12em",marginBottom:6}}>{s.label.toUpperCase()}</div>
                <div style={{color:s.color,fontSize:20,fontWeight:700,fontFamily:mono}}>{fmt(s.value)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Projects Table */}
      <Card style={{padding:0}}>
        <div style={{padding:"16px 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${t.border}`}}>
          <Label>Projects {new Date().getFullYear()}</Label>
          <button onClick={()=>setTableExpanded(e=>!e)} style={{background:"transparent",border:"none",color:t.sub,fontSize:12,fontFamily:mono,cursor:"pointer",letterSpacing:"0.08em"}}>
            {tableExpanded?"COLLAPSE ↑":"EXPAND ↓"} ({ytd.length} jobs)
          </button>
        </div>

        {/* Table header */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 0.6fr",gap:0,padding:"8px 20px",borderBottom:`1px solid ${t.border}`}}>
          {["Client","Type","Amount","Status","Date",""].map(h=>(
            <div key={h} style={{color:t.muted,fontSize:10,fontFamily:mono,letterSpacing:"0.1em"}}>{h}</div>
          ))}
        </div>

        {displayProjects.map((p,i)=>(
          <ProjectRow key={p.id} project={p} last={i===displayProjects.length-1} onClick={()=>onProjectClick(p)}/>
        ))}

        {!tableExpanded && ytd.length>4 && (
          <div style={{padding:"12px 20px",borderTop:`1px solid ${t.border}`,textAlign:"center"}}>
            <button onClick={()=>setTableExpanded(true)} style={{background:"transparent",border:"none",color:t.muted,fontSize:12,fontFamily:mono,cursor:"pointer",letterSpacing:"0.08em"}}>
              +{ytd.length-4} MORE PROJECTS
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProjectRow({project:p,onClick,last}){
  const [hov,setHov]=useState(false);
  const total = p.finalPrice + p.adjustments.reduce((s,a)=>s+a.amount,0);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 0.6fr",gap:0,padding:"13px 20px",borderBottom:last?"none":`1px solid ${t.border}`,background:hov?t.surfaceHigh:"transparent",cursor:"pointer",transition:"background 0.12s"}}>
      <div style={{color:t.text,fontSize:14,fontFamily:sans,fontWeight:500}}>{p.client}</div>
      <div style={{color:t.sub,fontSize:13,fontFamily:sans}}>{fenceLabel(p.fenceType)}</div>
      <div style={{color:t.text,fontSize:13,fontFamily:mono}}>{fmt(total)}</div>
      <StatusBadge status={p.status}/>
      <div style={{color:t.muted,fontSize:12,fontFamily:mono}}>{fmtD(p.createdAt)}</div>
      <div style={{color:t.muted,fontSize:12,textAlign:"right"}}>→</div>
    </div>
  );
}

// SCREEN: PROJECT DETAIL
function ProjectDetail({project:p,onBack,onInvoice}){
  const [showAdjust,setShowAdjust]=useState(false);
  const [adjLabel,setAdjLabel]=useState("");
  const [adjAmount,setAdjAmount]=useState("");
  const [adjustments,setAdjustments]=useState(p.adjustments||[]);

  const adjustTotal = adjustments.reduce((s,a)=>s+a.amount,0);
  const revisedTotal = p.finalPrice+adjustTotal;
  const remaining = revisedTotal-p.depositPaid;

  function addAdjustment(){
    if(!adjLabel||!adjAmount) return;
    setAdjustments(prev=>[...prev,{label:adjLabel,amount:Number(adjAmount)}]);
    setAdjLabel(""); setAdjAmount(""); setShowAdjust(false);
  }

  return (
    <div style={{padding:"0 0 40px"}}>
      {/* Back */}
      <button onClick={onBack} style={{background:"transparent",border:"none",color:t.muted,fontSize:13,fontFamily:mono,cursor:"pointer",letterSpacing:"0.08em",marginBottom:20,padding:0}}>
        ← BACK
      </button>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <h1 style={{color:t.text,fontSize:24,fontWeight:700,fontFamily:sans,letterSpacing:"-0.02em"}}>{p.client}</h1>
            <StatusBadge status={p.status}/>
          </div>
          <div style={{color:t.muted,fontSize:12,fontFamily:mono}}>{p.county} County · {fenceLabel(p.fenceType)} · {p.linearFeet} lin ft</div>
        </div>
        {p.status!=="paid" && (
          <HoverBtn primary onClick={()=>onInvoice(p)}>Generate Final Invoice</HoverBtn>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Financial Summary */}
        <Card>
          <Label>Financial Summary</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
            {[
              {label:"Original Estimate",  val:fmt(p.finalPrice),               color:t.text},
              {label:"Adjustments",        val:(adjustTotal>=0?"+":"")+fmt(adjustTotal), color:adjustTotal!==0?t.accent:t.muted},
              {label:"Revised Total",      val:fmt(revisedTotal),               color:t.text},
              {label:"Deposit Collected",  val:"-"+fmt(p.depositPaid),          color:t.success},
              {label:"Remaining Balance",  val:fmt(remaining),                  color:p.status==="paid"?t.muted:t.warn},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
                <span style={{color:t.sub,fontSize:13,fontFamily:sans}}>{r.label}</span>
                <span style={{color:r.color,fontSize:13,fontFamily:mono,fontWeight:600}}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Details */}
        <Card>
          <Label>Project Details</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
            {[
              {label:"Fence Type",  val:fenceLabel(p.fenceType)},
              {label:"Dimensions",  val:`${p.linearFeet} ft x ${p.heightFt} ft`},
              {label:"County",      val:`${p.county} County`},
              {label:"Created",     val:fmtD(p.createdAt)},
              {label:"Materials",   val:fmt(p.materialCost)},
              {label:"Labor",       val:fmt(p.laborCost)},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
                <span style={{color:t.sub,fontSize:13,fontFamily:sans}}>{r.label}</span>
                <span style={{color:t.text,fontSize:13,fontFamily:mono}}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Adjustments */}
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <Label>Change Orders & Adjustments</Label>
          <button onClick={()=>setShowAdjust(s=>!s)} style={{background:t.accentDim,border:`1px solid ${t.accent}`,color:t.accent,fontSize:11,fontFamily:mono,borderRadius:6,padding:"4px 10px",cursor:"pointer",letterSpacing:"0.08em"}}>+ ADD</button>
        </div>
        {adjustments.length===0 && !showAdjust && (
          <div style={{color:t.muted,fontSize:13,fontFamily:sans,padding:"8px 0"}}>No adjustments recorded.</div>
        )}
        {adjustments.map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`}}>
            <span style={{color:t.sub,fontSize:13,fontFamily:sans}}>{a.label}</span>
            <span style={{color:t.accent,fontSize:13,fontFamily:mono}}>{a.amount>=0?"+":""}{fmt(a.amount)}</span>
          </div>
        ))}
        {showAdjust && (
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <input value={adjLabel} onChange={e=>setAdjLabel(e.target.value)} placeholder="Description (e.g. Added gate)" style={{flex:2,background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",color:t.text,fontSize:13,fontFamily:sans,outline:"none"}}/>
            <input value={adjAmount} onChange={e=>setAdjAmount(e.target.value)} placeholder="$" type="number" style={{flex:1,background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",color:t.text,fontSize:13,fontFamily:mono,outline:"none"}}/>
            <HoverBtn primary onClick={addAdjustment} style={{padding:"8px 14px"}}>Add</HoverBtn>
          </div>
        )}
      </Card>

      {/* Notes */}
      {p.notes && (
        <Card>
          <Label>Notes</Label>
          <p style={{color:t.sub,fontSize:14,fontFamily:sans,lineHeight:1.6,marginTop:6}}>{p.notes}</p>
        </Card>
      )}
    </div>
  );
}

// SCREEN: FINAL INVOICE MODAL
function FinalInvoiceModal({project:p,onClose}){
  const [clientEmail,setClientEmail]=useState("");
  const [sent,setSent]=useState(false);
  const adjustTotal = (p.adjustments||[]).reduce((s,a)=>s+a.amount,0);
  const revisedTotal = p.finalPrice+adjustTotal;
  const remaining = revisedTotal-p.depositPaid;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,8,13,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div style={{background:t.surface,border:`1px solid ${t.accent}`,borderRadius:20,padding:28,width:"100%",maxWidth:460,animation:"fadeSlideUp 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{color:t.accent,fontSize:10,fontFamily:mono,letterSpacing:"0.12em",marginBottom:4}}>FINAL INVOICE</div>
            <div style={{color:t.text,fontSize:18,fontWeight:700,fontFamily:sans}}>{p.client}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:t.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>

        {[
          {label:"Total Project Value", val:fmt(revisedTotal)},
          {label:"Deposit Already Paid",val:"-"+fmt(p.depositPaid)},
          {label:"Remaining Balance",   val:fmt(remaining),accent:true},
        ].map(r=>(
          <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${t.border}`}}>
            <span style={{color:t.sub,fontSize:14,fontFamily:sans}}>{r.label}</span>
            <span style={{color:r.accent?t.accent:t.text,fontSize:r.accent?18:14,fontWeight:r.accent?700:400,fontFamily:mono}}>{r.val}</span>
          </div>
        ))}

        {!sent ? (
          <>
            <input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="Client email address"
              style={{width:"100%",background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"11px 14px",color:t.text,fontSize:14,fontFamily:sans,outline:"none",margin:"16px 0 10px"}}/>
            <HoverBtn primary onClick={()=>{if(clientEmail)setSent(true)}} style={{width:"100%",textAlign:"center"}}>
              Send Final Invoice via Stripe · {fmt(remaining)}
            </HoverBtn>
          </>
        ) : (
          <div style={{background:t.successDim,border:`1px solid ${t.success}33`,borderRadius:10,padding:"14px 16px",marginTop:16,color:t.success,fontSize:13,fontFamily:sans}}>
            ✓ Final invoice sent to {clientEmail} with Stripe payment link for {fmt(remaining)}
          </div>
        )}
      </div>
    </div>
  );
}

// SCREEN: NEW ESTIMATE (Chat UI)
function TypingDots(){
  return <div style={{display:"flex",gap:5,alignItems:"center",padding:"12px 16px"}}>
    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:t.accent,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
  </div>;
}

function ChatBubble({role,content,summary}){
  const bot=role==="bot";
  return <div style={{display:"flex",flexDirection:"column",alignItems:bot?"flex-start":"flex-end",marginBottom:16,animation:"fadeSlideUp 0.35s ease"}}>
    {bot&&<div style={{fontSize:10,color:t.muted,marginBottom:4,letterSpacing:"0.12em",fontFamily:mono}}>FENCEPRO AI</div>}
    <div style={{maxWidth:"78%",background:bot?t.surface:t.accentDim,border:`1px solid ${bot?t.border:t.accent}`,borderRadius:bot?"4px 20px 20px 20px":"20px 4px 20px 20px",padding:"12px 18px",color:bot?t.text:t.accent,fontSize:15,fontFamily:sans,lineHeight:1.6}}>
      {summary?<span style={{color:t.sub,fontSize:13}}><span style={{color:t.accent,marginRight:6}}>✓</span>{summary}</span>:content}
    </div>
  </div>;
}

function CountyPicker({onSelect}){
  const [q,setQ]=useState("");
  const list=CO_COUNTIES.filter(c=>c.toLowerCase().includes(q.toLowerCase()));
  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search county..." style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 16px",color:t.text,fontSize:14,fontFamily:sans,outline:"none"}}/>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,maxHeight:180,overflowY:"auto"}}>
      {list.map(c=><button key={c} onClick={()=>onSelect(c)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 14px",color:t.sub,fontSize:13,cursor:"pointer",fontFamily:sans,transition:"all 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.color=t.accent;e.currentTarget.style.background=t.accentDim;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.sub;e.currentTarget.style.background=t.surface;}}>{c} County</button>)}
    </div>
  </div>;
}

function FencePicker({onSelect}){
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    {FENCE_TYPES.map(f=><button key={f.id} onClick={()=>onSelect(f)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.background=t.accentDim;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.surface;}}>
      <div style={{fontSize:22,marginBottom:6}}>{f.icon}</div>
      <div style={{color:t.text,fontSize:14,fontWeight:600,fontFamily:sans}}>{f.label}</div>
      <div style={{color:t.muted,fontSize:12,marginTop:2,fontFamily:sans}}>{f.desc}</div>
    </button>)}
  </div>;
}

function Slider({label,min,max,step,value,onChange,format}){
  return <div style={{display:"flex",flexDirection:"column",gap:8}}>
    <div style={{display:"flex",justifyContent:"space-between"}}>
      <span style={{color:t.sub,fontSize:13,fontFamily:mono}}>{label}</span>
      <span style={{color:t.accent,fontSize:20,fontWeight:700,fontFamily:mono}}>{format?format(value):value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:t.accent,cursor:"pointer"}}/>
    <div style={{display:"flex",justifyContent:"space-between"}}>
      <span style={{color:t.muted,fontSize:11,fontFamily:mono}}>{format?format(min):min}</span>
      <span style={{color:t.muted,fontSize:11,fontFamily:mono}}>{format?format(max):max}</span>
    </div>
  </div>;
}

function DimensionsStep({onConfirm}){
  const [lf,setLf]=useState(100);const [h,setH]=useState(6);
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <Slider label="Linear Feet" min={20} max={1000} step={10} value={lf} onChange={setLf}/>
    <Slider label="Height" min={3} max={8} step={1} value={h} onChange={setH} format={v=>`${v} ft`}/>
    <ConfBtn onClick={()=>onConfirm({linearFeet:lf,heightFt:h})} label={`Confirm: ${lf} ft x ${h} ft tall`}/>
  </div>;
}

function CrewStep({onConfirm}){
  const [emp,setEmp]=useState(2);const [wage,setWage]=useState(22);
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <Slider label="Crew Size" min={1} max={10} step={1} value={emp} onChange={setEmp} format={v=>`${v} ${v===1?"worker":"workers"}`}/>
    <Slider label="Hourly Wage" min={15} max={75} step={1} value={wage} onChange={setWage} format={v=>`$${v}/hr`}/>
    <ConfBtn onClick={()=>onConfirm({employees:emp,hourlyWage:wage})} label={`Confirm: ${emp} workers @ $${wage}/hr`}/>
  </div>;
}

function ConfBtn({onClick,label}){
  const [h,setH]=useState(false);
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?t.accent:t.accentDim,border:`1px solid ${t.accent}`,borderRadius:10,padding:"12px 20px",color:h?t.bg:t.accent,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:sans,transition:"all 0.15s"}}>{label} →</button>;
}

// Estimate Card
function EstimateCard({quote,answers,onSave}){
  const [margin,setMargin]=useState(25);
  const [view,setView]=useState("summary");
  const [clientName,setClientName]=useState("");
  const [clientEmail,setClientEmail]=useState("");
  const [depositMode,setDepositMode]=useState("materials"); // "materials" | "custom"
  const [customDepositPct,setCustomDepositPct]=useState(40);
  const [sent,setSent]=useState(false);

  const finalPrice = quote.totalCost*(1+margin/100);
  const profit = finalPrice-quote.totalCost;

  // Deposit logic
  const materialsCoverPct = Math.round((quote.materialCost/finalPrice)*100);
  const depositPct = depositMode==="materials" ? materialsCoverPct : customDepositPct;
  const depositAmt = finalPrice*(depositPct/100);
  const balanceAmt = finalPrice-depositAmt;

  const tabs=["summary","breakdown","market"];

  return <div style={{animation:"fadeSlideUp 0.5s ease"}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${t.surface} 0%,#1a1a2e 100%)`,border:`1px solid ${t.accent}`,borderRadius:"16px 16px 0 0",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{color:t.accent,fontSize:11,letterSpacing:"0.15em",fontFamily:mono,marginBottom:4}}>YOUR ESTIMATE</div>
        <div style={{color:t.text,fontSize:28,fontWeight:700,fontFamily:sans}}>{fmt(finalPrice)}</div>
        <div style={{color:t.muted,fontSize:12,fontFamily:mono,marginTop:2}}>{answers.county} Co. · {answers.fenceType?.label} · {answers.linearFeet} lin ft</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{color:t.success,fontSize:13,fontFamily:mono}}>+{fmt(profit)}</div>
        <div style={{color:t.muted,fontSize:11,marginTop:2,fontFamily:mono}}>{margin}% margin</div>
      </div>
    </div>

    {/* Margin */}
    <div style={{background:t.surface,borderLeft:`1px solid ${t.accent}`,borderRight:`1px solid ${t.accent}`,padding:"16px 24px"}}>
      <Slider label="Profit Margin" min={5} max={60} step={1} value={margin} onChange={setMargin} format={v=>`${v}%`}/>
    </div>

    {/* Deposit */}
    <div style={{background:t.surface,borderLeft:`1px solid ${t.accent}`,borderRight:`1px solid ${t.accent}`,borderTop:`1px solid ${t.border}`,padding:"16px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <Label>Deposit Rate</Label>
        <div style={{display:"flex",gap:6}}>
          {[{id:"materials",label:"Cover Materials"},{id:"custom",label:"Custom"}].map(opt=>(
            <Pill key={opt.id} active={depositMode===opt.id} onClick={()=>setDepositMode(opt.id)}>{opt.label}</Pill>
          ))}
        </div>
      </div>
      {depositMode==="custom"&&(
        <div style={{marginBottom:12}}>
          <Slider label="Deposit %" min={10} max={75} step={5} value={customDepositPct} onChange={setCustomDepositPct} format={v=>`${v}%`}/>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{label:`Deposit (${depositPct}%)`,val:depositAmt,color:t.success},{label:"Balance Due",val:balanceAmt,color:t.warn}].map(s=>(
          <div key={s.label} style={{background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{color:t.muted,fontSize:10,fontFamily:mono,letterSpacing:"0.1em",marginBottom:4}}>{s.label.toUpperCase()}</div>
            <div style={{color:s.color,fontSize:18,fontWeight:700,fontFamily:mono}}>{fmt(s.val)}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Tabs */}
    <div style={{background:t.surface,borderLeft:`1px solid ${t.accent}`,borderRight:`1px solid ${t.accent}`,borderTop:`1px solid ${t.border}`,display:"flex"}}>
      {tabs.map(tab=><button key={tab} onClick={()=>setView(tab)} style={{flex:1,padding:"10px 0",background:view===tab?t.accentDim:"transparent",border:"none",borderBottom:view===tab?`2px solid ${t.accent}`:"2px solid transparent",color:view===tab?t.accent:t.muted,fontSize:12,letterSpacing:"0.1em",cursor:"pointer",fontFamily:mono,textTransform:"uppercase",transition:"all 0.15s"}}>{tab}</button>)}
    </div>

    {/* Tab content */}
    <div style={{background:t.surface,borderLeft:`1px solid ${t.accent}`,borderRight:`1px solid ${t.accent}`,padding:"20px 24px",minHeight:140}}>
      {view==="summary"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[["Materials",fmt(quote.materialCost),t.text],["Labor",fmt(quote.laborCost),t.text],["Subtotal",fmt(quote.totalCost),t.sub],["Margin",fmt(profit),t.success],["Client Price",fmt(finalPrice),t.accent]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
            <span style={{color:t.sub,fontSize:13,fontFamily:sans}}>{l}</span>
            <span style={{color:c,fontSize:14,fontWeight:600,fontFamily:mono}}>{v}</span>
          </div>
        ))}
        <div style={{color:t.muted,fontSize:11,marginTop:6,fontFamily:mono}}>{quote.sections} sections · {quote.totalHours.toFixed(0)} labor hrs</div>
      </div>}
      {view==="breakdown"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        <Label>Materials Bill</Label>
        {quote.breakdown.map(r=><div key={r.item} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}`}}>
          <span style={{color:t.sub,fontSize:13,fontFamily:sans}}>{r.item} x {r.qty}</span>
          <span style={{color:t.text,fontSize:13,fontFamily:mono}}>{fmt(r.qty*r.unit)}</span>
        </div>)}
      </div>}
      {view==="market"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Label>{answers.county?.toUpperCase()} County Market Rates</Label>
        <div style={{display:"flex",gap:10}}>
          {[["Market Low",fmt(quote.marketLow)],["Market High",fmt(quote.marketHigh)],["Your Quote",fmt(finalPrice)]].map(([l,v])=>(
            <div key={l} style={{flex:1,background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{color:t.muted,fontSize:10,fontFamily:mono,letterSpacing:"0.08em",marginBottom:4}}>{l}</div>
              <div style={{color:t.accent,fontSize:15,fontWeight:700,fontFamily:mono}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{color:t.sub,fontSize:12,fontFamily:sans,lineHeight:1.6}}>
          {finalPrice<quote.marketLow?"⚠ Below market - consider raising margin.":finalPrice>quote.marketHigh?"⚠ Above market high - competitive risk.":"✓ Competitive within local market range."}
        </div>
      </div>}
    </div>

    {/* Send Estimate */}
    <div style={{background:t.surface,borderLeft:`1px solid ${t.accent}`,borderRight:`1px solid ${t.accent}`,borderTop:`1px solid ${t.border}`,borderRadius:"0 0 16px 16px",padding:"20px 24px"}}>
      <Label>Send Estimate</Label>
      {!sent?(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
          <input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Client name" style={{background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",color:t.text,fontSize:14,fontFamily:sans,outline:"none"}}/>
          <input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="Client email" style={{background:t.bgAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",color:t.text,fontSize:14,fontFamily:sans,outline:"none"}}/>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <ConfBtn onClick={()=>{if(clientName&&clientEmail){setSent(true);onSave&&onSave({clientName,clientEmail,finalPrice,depositAmt,depositPct,margin,answers,quote})}}} label={`Send Estimate · Deposit ${fmt(depositAmt)}`}/>
          </div>
        </div>
      ):(
        <div style={{background:t.successDim,border:`1px solid ${t.success}33`,borderRadius:10,padding:"14px 16px",color:t.success,fontSize:13,fontFamily:sans}}>
          ✓ Estimate sent to {clientEmail} - deposit request of {fmt(depositAmt)} via Stripe
        </div>
      )}
    </div>
  </div>;
}

const STAGES=[
  {id:"county",     msg:"Hey! Let's build your estimate. Which Colorado county is the project in?", render:(next)=><CountyPicker onSelect={v=>next(v,`${v} County`)}/>},
  {id:"fenceType",  msg:"Great. What type of fence are you building?",                                render:(next)=><FencePicker onSelect={v=>next(v,v.label)}/>},
  {id:"dimensions", msg:"How long is the run and how tall?",                                          render:(next)=><DimensionsStep onConfirm={v=>next(v,`${v.linearFeet} ft x ${v.heightFt} ft`)}/>},
  {id:"crew",       msg:"Tell me about your crew - how many people and what do you pay them?",       render:(next)=><CrewStep onConfirm={v=>next(v,`${v.employees} workers @ $${v.hourlyWage}/hr`)}/>},
];

function NewEstimate({onSave}){
  const [messages,setMessages]=useState([]);
  const [stage,setStage]=useState(0);
  const [answers,setAnswers]=useState({});
  const [typing,setTyping]=useState(false);
  const [estimate,setEstimate]=useState(null);
  const [key,setKey]=useState(0);
  const bottomRef=useRef(null);

  useEffect(()=>{
    setTyping(true);
    setTimeout(()=>{setTyping(false);setMessages([{role:"bot",content:STAGES[0].msg}]);},900);
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,typing,estimate]);

  function handleAnswer(stageId,value,summary){
    const ans={...answers};
    if(stageId==="county")     ans.county=value;
    if(stageId==="fenceType")  ans.fenceType=value;
    if(stageId==="dimensions") {ans.linearFeet=value.linearFeet;ans.heightFt=value.heightFt;}
    if(stageId==="crew")       {ans.employees=value.employees;ans.hourlyWage=value.hourlyWage;}
    setAnswers(ans);
    setMessages(p=>[...p,{role:"user",summary}]);
    const next=stage+1;
    if(next<STAGES.length){
      setStage(next);setTyping(true);
      setTimeout(()=>{setTyping(false);setMessages(p=>[...p,{role:"bot",content:STAGES[next].msg}]);setKey(k=>k+1);},800);
    } else {
      setTyping(true);
      setTimeout(()=>{
        setTyping(false);
        const q=calcQuote({fenceType:ans.fenceType?.id||"wood_privacy",linearFeet:ans.linearFeet,heightFt:ans.heightFt,employees:ans.employees,hourlyWage:ans.hourlyWage});
        setEstimate({data:q,answers:ans});
        setMessages(p=>[...p,{role:"bot",content:"Here's your estimate. Set your margin, choose a deposit structure, then send it to your client."}]);
      },1200);
    }
  }

  const curStage=STAGES[stage];

  return (
    <div style={{paddingBottom:estimate?40:140}}>
      {messages.map((m,i)=><ChatBubble key={i} role={m.role} content={m.content} summary={m.summary}/>)}
      {typing&&<div style={{display:"flex",marginBottom:16}}><div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"4px 20px 20px 20px"}}><TypingDots/></div></div>}
      {estimate&&!typing&&<div style={{marginTop:8,marginBottom:24}}><EstimateCard quote={estimate.data} answers={estimate.answers} onSave={onSave}/></div>}
      <div ref={bottomRef}/>
      {!estimate&&!typing&&curStage&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:`linear-gradient(to top,${t.bg} 60%,transparent)`,padding:"24px 0 28px",display:"flex",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:640,padding:"0 24px"}} key={key}>
            {curStage.render((v,s)=>handleAnswer(curStage.id,v,s))}
          </div>
        </div>
      )}
      {estimate&&(
        <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
          <button onClick={()=>{setMessages([]);setAnswers({});setEstimate(null);setStage(0);setKey(k=>k+1);setTyping(true);setTimeout(()=>{setTyping(false);setMessages([{role:"bot",content:STAGES[0].msg}]);},600);}}
            style={{background:"transparent",border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 20px",color:t.muted,fontSize:12,cursor:"pointer",fontFamily:mono,letterSpacing:"0.1em",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.color=t.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.muted;}}>
            ↺ NEW ESTIMATE
          </button>
        </div>
      )}
    </div>
  );
}

// NAV
function NavItem({icon,label,active,onClick}){
  return <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"transparent",border:"none",cursor:"pointer",padding:"8px 16px",borderRadius:10,transition:"all 0.15s",color:active?t.accent:t.muted}}>
    <span style={{fontSize:18}}>{icon}</span>
    <span style={{fontSize:10,fontFamily:mono,letterSpacing:"0.08em"}}>{label}</span>
    {active&&<div style={{width:4,height:4,borderRadius:"50%",background:t.accent,boxShadow:`0 0 6px ${t.accent}`}}/>}
  </button>;
}

// ROOT APP
export default function FenceProApp(){
  const [screen,setScreen]=useState("dashboard"); // dashboard | estimate | detail
  const [projects,setProjects]=useState(MOCK_PROJECTS);
  const [selectedProject,setSelectedProject]=useState(null);
  const [invoiceProject,setInvoiceProject]=useState(null);
  const [tab,setTab]=useState("dashboard");

  function handleProjectClick(p){
    setSelectedProject(p);
    setScreen("detail");
  }

  function handleNewEstimate(){
    setTab("estimate");
    setScreen("estimate");
  }

  function handleSaveEstimate(data){
    const newProj={
      id:`p${Date.now()}`,
      client:data.clientName,
      county:data.answers.county,
      fenceType:data.answers.fenceType?.id||"wood_privacy",
      linearFeet:data.answers.linearFeet,
      heightFt:data.answers.heightFt,
      materialCost:data.quote.materialCost,
      laborCost:data.quote.laborCost,
      totalCost:data.quote.totalCost,
      depositRate:data.depositPct/100,
      depositPaid:data.depositAmt,
      finalPrice:data.finalPrice,
      status:"pending",
      createdAt:new Date().toISOString().split("T")[0],
      paidAt:null,
      adjustments:[],
      notes:"",
    };
    setProjects(p=>[newProj,...p]);
  }

  function switchTab(tabName){
    setTab(tabName);
    if(tabName==="dashboard") setScreen("dashboard");
    if(tabName==="estimate")  setScreen("estimate");
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:#08080d;} @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}} @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:4px;} input:focus{border-color:#e8c547 !important;outline:none;}`}</style>

      <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",fontFamily:sans}}>

        {/* Top bar */}
        <div style={{width:"100%",borderBottom:`1px solid ${t.border}`,background:t.surface,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:t.accentDim,border:`1px solid ${t.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🪵</div>
            <div>
              <div style={{color:t.text,fontSize:14,fontWeight:700,letterSpacing:"-0.02em"}}>FencePro</div>
              <div style={{color:t.muted,fontSize:9,fontFamily:mono,letterSpacing:"0.1em"}}>COLORADO</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4}}>
            <NavItem icon="DSH" label="DASH" active={tab==="dashboard"} onClick={()=>switchTab("dashboard")}/>
            <NavItem icon="EST" label="ESTIMATE" active={tab==="estimate"} onClick={()=>switchTab("estimate")}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:t.success,boxShadow:`0 0 6px ${t.success}`}}/>
            <span style={{color:t.muted,fontSize:11,fontFamily:mono}}>LIVE</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,maxWidth:820,width:"100%",margin:"0 auto",padding:"28px 24px 0",overflowY:"auto"}}>
          {screen==="dashboard"&&(
            <Dashboard projects={projects} onProjectClick={handleProjectClick} onNewEstimate={handleNewEstimate}/>
          )}
          {screen==="estimate"&&(
            <NewEstimate onSave={handleSaveEstimate}/>
          )}
          {screen==="detail"&&selectedProject&&(
            <ProjectDetail
              project={selectedProject}
              onBack={()=>{setScreen("dashboard");setTab("dashboard");}}
              onInvoice={p=>setInvoiceProject(p)}
            />
          )}
        </div>
      </div>

      {invoiceProject&&(
        <FinalInvoiceModal project={invoiceProject} onClose={()=>setInvoiceProject(null)}/>
      )}
    </>
  );
}

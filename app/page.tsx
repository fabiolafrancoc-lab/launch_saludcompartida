'use client';
import React, { useState, useRef, useEffect } from 'react';

const VALIDATE_URL     = 'https://imndmmbtsllyssvokdlh.supabase.co/functions/v1/validate-code';
const CODE_NOT_WORKING = 'https://imndmmbtsllyssvokdlh.supabase.co/functions/v1/code-not-working';
const LAD_URL          = process.env.NEXT_PUBLIC_LAD_APP_URL ?? '';
const WA_SOPORTE       = '17869648040';
const BOOK_THERAPY     = 'https://api.saludcompartida.app/functions/v1/book-therapy';
const UPDATE_PROFILE      = 'https://api.saludcompartida.app/functions/v1/update-profile';
const FAMILY_MEMBERS_URL  = 'https://imndmmbtsllyssvokdlh.supabase.co/functions/v1/manage-family-members';

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const C = {
  bg:'#0A0F1C', surface:'#111827', card:'#1A2235', border:'#1E2D45',
  muted:'#4B6080', text:'#E8EDF5', dim:'#8899AA',
  cyan:'#06B6D4', magenta:'#EC4899', indigo:'#818CF8', green:'#7CB69D', gold:'#F5A623', wgreen:'#10B981',
};
const TABS = [
  { id:'doctor',         label:'Doctor',        color:C.wgreen  },
  { id:'terapia',        label:'Terapia',        color:C.indigo  },
  { id:'acompanamiento', label:'Acompañamiento', color:C.magenta },
  { id:'ahorro',         label:'Ahorro',         color:C.cyan    },
  { id:'cuenta',         label:'Mi Cuenta',      color:C.gold    },
  { id:'otros',          label:'Otros',          color:C.muted   },
];
const PARENTESCOS = ['Mamá','Papá','Hermana','Hermano','Abuela','Abuelo','Tía','Tío','Otro'];

// ─── ICONOS SVG ───────────────────────────────────────────────────
const IDoctor  = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/><path d="M14 2a4 4 0 014 4M14 6h4M16 4v4"/></svg>;
const ITerapia = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const ILupita  = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IAhorro  = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const ICuenta  = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IHeart   = ({s=20,c,fill='none'}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const IVideo   = ({s=22}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IPhone   = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c||'#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IPlay    = ({s=18}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IPause   = ({s=14}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IPill    = ({s=16,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5L3.5 13.5a5 5 0 117.07-7.07l7 7a5 5 0 01-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
const IStet    = ({s=16,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12c0 4.142 3.358 7.5 7.5 7.5S19.5 16.142 19.5 12"/><path d="M4.5 12V7A2.5 2.5 0 017 4.5h.5M19.5 12V7A2.5 2.5 0 0017 4.5h-.5"/><circle cx="19.5" cy="7" r="1.5" fill={c}/></svg>;
const ICheck   = ({s=11,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ICal     = ({s=16,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IChevR   = ({s=14,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c||'#4B6080'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IPlus    = ({s=18,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IUsers   = ({s=18,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const ITrash   = ({s=15,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const ISparkle = ({s=16,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const ISmile   = ({s=16,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const IOtros  = ({s=22,c}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const IWA = () => <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const IStar    = ({s=12,c,filled}:any) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ─── ÁTOMOS ───────────────────────────────────────────────────────
const Dot = ({color}:any) => <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}`,flexShrink:0}}/>;
const Card = ({children,style={}}:any) => <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'14px 16px',...style}}>{children}</div>;
const SLabel = ({children,color}:any) => <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color,marginBottom:10}}>{children}</p>;
const Badge = ({children,color}:any) => <span style={{display:'inline-block',padding:'3px 10px',borderRadius:20,background:color+'18',color,border:`1px solid ${color}30`,fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{children}</span>;
const Stars = ({n=5,color}:any) => <div style={{display:'flex',gap:2}}>{Array.from({length:5},(_,i)=><IStar key={i} s={11} c={color} filled={i<n}/>)}</div>;
const Waveform = ({color,w=60}:any) => <svg width={w} height={20} viewBox={`0 0 ${w} 20`}>{Array.from({length:Math.floor(w/5)},(_,i)=>{const h=4+Math.sin(i*0.9)*6+Math.random()*4;return <rect key={i} x={i*5} y={(20-h)/2} width={3} height={h} rx={1.5} fill={color} opacity={0.7}/>;})}</svg>;
const PhotoSlot = ({size=60,color,initials,caption}:any) => <div style={{width:size,height:size,borderRadius:'50%',background:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative'}}><span style={{color,fontSize:size*0.28,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{initials}</span></div>;
const VideoSlot = ({color,title,subtitle,duration='1:45',ratio='50%',compact=false}:any) => <div style={{borderRadius:14,overflow:'hidden',background:`linear-gradient(145deg,${color}14,#0A0F1C)`,border:`1px solid ${color}30`,position:'relative',paddingBottom:ratio}}><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:12}}><div style={{width:compact?36:44,height:compact?36:44,borderRadius:'50%',background:color+'22',border:`1.5px solid ${color}50`,display:'flex',alignItems:'center',justifyContent:'center'}}><IPlay s={compact?14:18}/></div>{!compact&&<><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.text,fontWeight:600,textAlign:'center',lineHeight:1.3}}>{title}</p>{subtitle&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.muted,textAlign:'center'}}>{subtitle}</p>}</>}<span style={{position:'absolute',bottom:8,right:10,background:'#000A',padding:'2px 7px',borderRadius:6,color:'#fff',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{duration}</span></div></div>;
const NavBar = ({active,onNav,position}:any) => {
  if(position==='top') return <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,overflowX:'auto',scrollbarWidth:'none'}}>{TABS.map(t=>{const on=t.id===active;return<button key={t.id} onClick={()=>onNav(t.id)} style={{flex:'0 0 auto',padding:'8px 14px',border:'none',background:on?t.color+'14':'transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',borderBottom:on?`2px solid ${t.color}`:'2px solid transparent',marginBottom:-1,minWidth:70,transition:'all 0.2s'}}><span style={{fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:t.color,opacity:on?1:0.45,letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{t.label}</span></button>;})} </div>;
  return <div style={{display:'flex',background:'#0D1B2A',borderTop:`1px solid ${C.border}`,paddingBottom:'env(safe-area-inset-bottom,0px)'}}>{TABS.map(t=>{const on=t.id===active;const Icon=({doctor:IDoctor,terapia:ITerapia,acompanamiento:ILupita,ahorro:IAhorro,cuenta:ICuenta,otros:IOtros} as any)[t.id];return<button key={t.id} onClick={()=>onNav(t.id)} style={{flex:1,padding:'10px 4px 8px',border:'none',background:on?t.color+'12':'transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',transition:'all 0.2s'}}><Icon s={20} c={t.color} style={{opacity:on?1:0.4}}/><span style={{fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:t.color,opacity:on?1:0.4,letterSpacing:'0.04em'}}>{t.label}</span></button>;})} </div>;
};

// ─── CSS ─────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;}
  html,body{height:100%;height:-webkit-fill-available;}
  .sc-shell{height:100dvh;height:-webkit-fill-available;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .sc-tc{animation:fadeUp 0.26s ease-out forwards;}
  .sc-desk-bg{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;background:radial-gradient(ellipse at 30% 20%,#06B6D418 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,#818CF814 0%,transparent 50%),#060B14;padding:0;}
  @media(min-width:640px){.sc-desk-bg{padding:40px 32px 80px;}.sc-shell{border-radius:28px!important;overflow:hidden;box-shadow:0 32px 80px #00000080,0 0 0 1px #1E2D45;}}
  ::-webkit-scrollbar{display:none;}
  input::placeholder{color:#334155;letter-spacing:2px;}
`;

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════
function TabDoctor() {
  const col = C.wgreen;

  const especialidades = [
    {n:'Medicina General',   hot:true,  svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>},
    {n:'Pediatría',          hot:true,  svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M8 21v-1a4 4 0 0 1 8 0v1"/><path d="M9 12h6"/></svg>},
    {n:'Ginecología',        hot:true,  svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="5"/><path d="M12 12v8m-3-3h6"/></svg>},
    {n:'Nutrición',          hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.5 3-2 4l2 12H8L10 10c-1.5-1-2-2.5-2-4a4 4 0 0 1 4-4z"/></svg>},
    {n:'Urgencias',          hot:true,  svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>},
    {n:'Fertilidad',         hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>},
    {n:'Sexología',          hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/></svg>},
    {n:'Climaterio',         hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>},
    {n:'Medicina Fetal',     hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>},
    {n:'Andropausia',        hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5"/><path d="m21 3-6.35 6.35M15 3h6v6"/></svg>},
    {n:'Patología Mamaria',  hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>},
    {n:'Uroginecología',     hot:false, svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/><path d="M12 6v12"/></svg>},
  ];

  const pasos = [
    {num:'1', titulo:'Elige tu especialidad', desc:'Medicina General, Pediatría, Ginecología y 20+ especialidades disponibles',
      svg:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>},
    {num:'2', titulo:'Describe tus síntomas', desc:'Selecciona el motivo de consulta. Tus antecedentes ya estarán precargados',
      svg:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>},
    {num:'3', titulo:'Habla con el médico', desc:'Videollamada con médico certificado en minutos. Sin fila, sin traslado',
      svg:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>},
  ];

  const CTAButton = ({label, icon}:any) => (
    <button
      onClick={()=>window.open(LAD_URL||'https://llamandoaldoctor.com','_blank')}
      style={{width:'100%',padding:'18px 0',borderRadius:14,border:'none',background:`linear-gradient(135deg,${col},#1aab4e)`,display:'flex',alignItems:'center',justifyContent:'center',gap:12,cursor:'pointer',boxShadow:`0 10px 30px ${col}50`,transition:'transform .15s'}}>
      {icon}
      <span style={{color:'#fff',fontSize:18,fontWeight:800,fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.01em'}}>{label}</span>
    </button>
  );

  return (
    <div style={{padding:'0 16px 32px'}}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <Card style={{marginBottom:16,background:`linear-gradient(145deg,${col}1A,#071a0e)`,borderColor:col+'55',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:180,height:180,borderRadius:'50%',background:`radial-gradient(circle,${col}18,transparent 70%)`}}/>
        <div style={{position:'absolute',bottom:-30,left:-20,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${col}0C,transparent 70%)`}}/>
        {/* Live indicator */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:col+'18',border:`1px solid ${col}40`,borderRadius:20,padding:'5px 12px'}}>
            <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:col,boxShadow:`0 0 8px ${col}`,animation:'pulse 2s infinite'}}/>
            <span style={{color:col,fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.12em'}}>12 MÉDICOS DISPONIBLES AHORA</span>
          </div>
        </div>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:C.text,fontWeight:700,marginBottom:10,lineHeight:1.3}}>Tu médico,<br/>donde tú estás</p>
        {/* Social proof strip */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {[['4.9★','Rating'],['50K+','Consultas'],['24/7','Disponible']].map(([v,k])=>(
            <div key={k} style={{flex:1,background:col+'12',border:`1px solid ${col}30`,borderRadius:10,padding:'8px 4px',textAlign:'center'}}>
              <p style={{color:col,fontSize:15,fontWeight:800,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{v}</p>
              <p style={{color:C.muted,fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{k}</p>
            </div>
          ))}
        </div>
        {/* Emotional scenarios */}
        {[
          {title:'Son las 3 AM y tu hijo tiene fiebre',desc:'Ya no tienes que salir de casa en la madrugada. Un médico te atiende ahora mismo.',
            svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
          {title:'Te duele el cuerpo y no sabes por qué',desc:'Sin fila. Sin traslado. Sin esperar horas. Un médico te escucha hoy.',
            svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>},
        ].map(({title,desc,svg},i)=>(
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'13px 14px',borderRadius:12,background:col+'0D',border:`1px solid ${col}28`,marginBottom:i===0?10:0}}>
            <div style={{width:38,height:38,borderRadius:10,background:col+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{svg}</div>
            <div><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:C.text,fontWeight:700,marginBottom:3}}>{title}</p><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.dim,lineHeight:1.55}}>{desc}</p></div>
          </div>
        ))}
      </Card>

      {/* ── CTA 1 — VIDEOLLAMADA ───────────────────────────── */}
      <div style={{marginBottom:18}}>
        <CTAButton
          label="Videollamada con Doctor"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
        />
      </div>

      {/* ── VIDEO ──────────────────────────────────────────── */}
      <div style={{marginBottom:20}}>
        <SLabel color={col}>Tu familia siempre protegida</SLabel>
        <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${col}30`,background:'#000'}}>
          <div style={{position:'relative',paddingBottom:'56.25%',height:0}}>
            <iframe src="https://www.youtube.com/embed/iMq4uBxQEsQ?rel=0&modestbranding=1&playsinline=1" title="Doctor 24h" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
          </div>
          <div style={{padding:'10px 14px',background:`linear-gradient(145deg,${col}12,#0A0F1C)`}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.text,fontWeight:600,margin:0}}>Un médico cuando tu familia más lo necesita</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:'3px 0 0'}}>A cualquier hora · Sin salir de casa</p>
          </div>
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────── */}
      <SLabel color={col}>¿Cómo funciona?</SLabel>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:22}}>
        {pasos.map((p,i)=>(
          <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'14px',borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
            <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${col}28,${col}10)`,border:`1px solid ${col}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:col}}>
              {p.svg}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:col,background:col+'18',padding:'2px 8px',borderRadius:20,letterSpacing:'.08em'}}>PASO {p.num}</span>
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:C.text,fontWeight:700,marginBottom:3}}>{p.titulo}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,lineHeight:1.6}}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ESPECIALIDADES — REDESIGNED ────────────────────── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <SLabel color={col}>20+ especialidades</SLabel>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:col,fontWeight:700,background:col+'15',border:`1px solid ${col}30`,borderRadius:20,padding:'3px 10px'}}>Toca para consultar</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
        {especialidades.map(({n,hot,svg})=>(
          <div key={n}
            style={{display:'flex',flexDirection:'column',alignItems:'center',gap:9,padding:'16px 10px',borderRadius:14,background:hot?`linear-gradient(145deg,${col}1C,${C.card})`:`${C.card}`,border:`1px solid ${hot?col+'50':C.border}`,cursor:'pointer',position:'relative',transition:'all .2s'}}
            onClick={()=>window.open(LAD_URL||'https://llamandoaldoctor.com','_blank')}>
            {hot && <span style={{position:'absolute',top:8,right:8,fontSize:9,fontWeight:700,color:col,background:col+'20',border:`1px solid ${col}40`,borderRadius:10,padding:'2px 6px',letterSpacing:'.06em'}}>POPULAR</span>}
            <div style={{width:48,height:48,borderRadius:13,background:`linear-gradient(135deg,${col}28,${col}12)`,border:`1px solid ${col}45`,display:'flex',alignItems:'center',justifyContent:'center',color:col,boxShadow:hot?`0 4px 16px ${col}25`:'none'}}>
              {svg}
            </div>
            <span style={{fontSize:13,color:C.text,fontFamily:"'DM Sans',sans-serif",fontWeight:600,textAlign:'center',lineHeight:1.3}}>{n}</span>
          </div>
        ))}
      </div>

      {/* ── ESTUDIOS MÉDICOS ───────────────────────────────── */}
      <div style={{borderRadius:14,padding:'16px',background:`linear-gradient(135deg,${col}0A,${C.card})`,border:`1px solid ${col}28`,marginBottom:22,display:'flex',gap:12,alignItems:'flex-start'}}>
        <div style={{width:44,height:44,borderRadius:12,background:col+'1A',border:`1px solid ${col}35`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:C.text,fontWeight:700,marginBottom:4}}>Sube tus estudios médicos</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:10}}>Comparte tus exámenes antes de la consulta para que el médico llegue preparado.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {['Laboratorio','Ecografía','Radiografía','Resonancia','ECG'].map(e=>(
              <span key={e} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:col,background:col+'14',border:`1px solid ${col}28`,padding:'3px 9px',borderRadius:20}}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIDEO 2 ────────────────────────────────────────── */}
      <div style={{marginBottom:22}}>
        <SLabel color={col}>Conoce a tu doctor</SLabel>
        <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${col}30`,background:'#000'}}>
          <div style={{position:'relative',paddingBottom:'56.25%',height:0}}>
            <iframe src="https://www.youtube.com/embed/uf-DoHz9zOI?rel=0&modestbranding=1&playsinline=1" title="Conoce a tu Doctor" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
          </div>
          <div style={{padding:'10px 14px',background:`linear-gradient(145deg,${col}12,#0A0F1C)`}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.text,fontWeight:600,margin:0}}>Médicos certificados listos para atenderte</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:'3px 0 0'}}>Profesionales de confianza · 24/7</p>
          </div>
        </div>
      </div>

      {/* ── CTA 2 — LLAMAR DOCTOR AHORA ───────────────────── */}
      <div style={{borderRadius:16,padding:'20px 16px',background:`linear-gradient(145deg,${col}16,#071a0e)`,border:`1px solid ${col}45`,marginBottom:4}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:col,boxShadow:`0 0 8px ${col}`}}/>
          <span style={{color:col,fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.12em'}}>MÉDICOS EN LÍNEA AHORA</span>
        </div>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:4,lineHeight:1.3}}>¿Te sientes mal ahora?<br/>No esperes.</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.dim,marginBottom:16,lineHeight:1.6}}>Un médico certificado te atiende en minutos. Sin traslado, sin fila, a cualquier hora.</p>
        <CTAButton
          label="Llamar Doctor Ahora"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}
        />
      </div>

    </div>
  );
}

function TabTerapia() {
  const col = C.indigo;
  const [booking, setBooking]       = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [error, setError]           = useState('');

  const terapeutas = [
    {init:'AT',nombre:'Psic. Ana Torres',esp:'Ansiedad y duelo migratorio',exp:'8 años',stars:5,activa:true},
    {init:'CR',nombre:'Psic. Carlos Ruiz',esp:'Relaciones y familia',exp:'6 años',stars:5,activa:false}
  ];
  const hist: any[] = [];

  const handleReservar = async () => {
    if (booking) return;
    setBooking(true);
    setError('');
    // Open window synchronously (user gesture) BEFORE async fetch
    // to avoid mobile popup blockers
    const win = window.open('', '_blank');
    try {
      const userData = (window as any).__SC_USER__;
      const familyCode = userData?._code ?? '';
      const res = await fetch(BOOK_THERAPY, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({family_code: familyCode})
      });
      const data = await res.json();
      if (data.ok && data.url) {
        if (win) { win.location.href = data.url; } else { window.open(data.url, '_blank'); }
      } else {
        if (win) win.close();
        setError('Servicio no disponible en este momento. Intenta más tarde.');
      }
    } catch(_) {
      if (win) win.close();
      setError('Servicio no disponible en este momento. Intenta más tarde.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const userData = (window as any).__SC_USER__;
      await fetch('/api/cancel-therapy', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          familyCode:  userData?._code ?? '',
          familyName:  userData?.family_first_name ?? '',
          familyEmail: userData?.family_email ?? '',
          familyPhone: userData?.family_phone ?? '',
        })
      });
      setCancelDone(true);
      setShowCancel(false);
    } catch(_) {
      setCancelDone(true);
      setShowCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{padding:'0 16px 24px'}}>

      {/* HERO EMOCIONAL */}
      <Card style={{marginBottom:16,background:`linear-gradient(145deg,${col}18 0%,#1A1030 100%)`,borderColor:col+'50',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:140,height:140,borderRadius:'50%',background:`radial-gradient(circle,${col}14,transparent 70%)`}}/>
        <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:col+'22',border:`1.5px solid ${col}50`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 20px ${col}30`}}>
            <IHeart s={22} c={col} fill={col+'40'}/>
          </div>
        </div>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,textAlign:'center',marginBottom:10,lineHeight:1.3}}>Cuidar tu mente<br/>es tan importante<br/>como cuidar tu cuerpo</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.dim,textAlign:'center',lineHeight:1.6,marginBottom:16}}>No estás sola. Millones de personas sienten lo mismo que tú sientes hoy.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[[ISparkle,'Pedir ayuda no es debilidad — es valentía'],[ISmile,'Sentirte bien está en tus manos'],[IHeart,'Tú mereces una vida tranquila']].map(([Icon,txt]:any,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:9,background:col+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon s={15} c={col}/></div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.text,lineHeight:1.4}}>{txt}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* VIDEOS */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
        <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${col}30`,background:'#000'}}>
          <div style={{position:'relative',paddingBottom:'100%',height:0}}>
            <iframe src="https://www.youtube.com/embed/e4oXgVBPwvI?rel=0&modestbranding=1&playsinline=1" title="Salud Mental 1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
          </div>
          <div style={{padding:'8px 10px',background:`linear-gradient(145deg,${col}10,#0A0F1C)`}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:0,textAlign:'center'}}>Lo que sientes</p>
          </div>
        </div>
        <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${col}30`,background:'#000'}}>
          <div style={{position:'relative',paddingBottom:'100%',height:0}}>
            <iframe src="https://www.youtube.com/embed/SD3rF33uzW0?rel=0&modestbranding=1&playsinline=1" title="Salud Mental 2" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
          </div>
          <div style={{padding:'8px 10px',background:`linear-gradient(145deg,${col}10,#0A0F1C)`}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:0,textAlign:'center'}}>Cómo puedes sentirte</p>
          </div>
        </div>
      </div>

      {/* TERAPEUTAS */}
      <SLabel color={col}>Tus terapeutas</SLabel>
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
        {terapeutas.map((t,i)=>(
          <Card key={i} style={{padding:'14px 16px',borderColor:t.activa?col+'55':C.border,background:t.activa?`linear-gradient(145deg,${col}10,${C.card})`:C.card}}>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              <div style={{width:64,height:64,borderRadius:'50%',overflow:'hidden',border:`2px solid ${col}50`,flexShrink:0}}>
                <img src={['/psycho4.jpeg','/psycho3.jpeg','/psycho4.jpeg'][i]} alt={t.nombre} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{const t=e.target as HTMLImageElement;t.style.display='none';}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:3}}>
                  <p style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.text,fontWeight:700}}>{t.nombre}</p>
                  {t.activa&&<Badge color={col}>Mi terapeuta</Badge>}
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:'#E8EDF5',marginBottom:4}}>{t.esp}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:'#8BA4BF',marginBottom:8}}>{t.exp} de experiencia</p>
                <Stars n={t.stars} color={col}/>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AGENDAR */}
      <SLabel color={col}>Agenda tu sesión semanal</SLabel>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.muted,marginBottom:16,lineHeight:1.65,textAlign:'center'}}>
        Los horarios disponibles se muestran en tiempo real dentro de la plataforma de tu terapeuta. Elige el que mejor te acomode.
      </p>

      {error && (
        <div style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#F87171',margin:0}}>{error}</p>
        </div>
      )}

      {cancelDone && (
        <Card style={{marginBottom:16,borderColor:col+'50',background:`linear-gradient(135deg,${col}12,${C.card})`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{color:col,fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.14em'}}>MENSAJE ENVIADO</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.dim}}>Tu terapeuta fue notificada automáticamente.</p>
        </Card>
      )}

      {/* BOTÓN RESERVAR */}
      <button
        onClick={handleReservar}
        disabled={booking}
        style={{width:'100%',padding:'18px 0',borderRadius:14,border:'none',background:booking?`${col}60`:`linear-gradient(135deg,${col},#6366F1)`,color:'#fff',fontSize:18,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:booking?'default':'pointer',marginBottom:12,boxShadow:`0 6px 24px ${col}40`,display:'flex',alignItems:'center',justifyContent:'center',gap:10,letterSpacing:'0.02em'}}>
        {booking
          ? <><svg width="18" height="18" viewBox="0 0 20 20" style={{animation:'spin 1s linear infinite'}}><circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M10 2a8 8 0 0 1 8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>Conectando...</>
          : <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Reservar hora</>}
      </button>

      {/* BOTÓN CANCELAR */}
      {!cancelDone && (
        <button
          onClick={()=>setShowCancel(true)}
          style={{width:'100%',padding:'13px 0',borderRadius:12,border:`1px solid ${col}40`,background:'transparent',color:col,fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Cancelar hora
        </button>
      )}

      {/* AVISO 24H */}
      <div style={{borderRadius:12,padding:'12px 14px',background:'rgba(99,102,241,.07)',border:`1px solid ${col}25`,marginBottom:20,display:'flex',gap:10,alignItems:'flex-start'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:2}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,lineHeight:1.65,margin:0}}>
          Si no puedes asistir, avisa con al menos <strong style={{color:C.dim}}>24 horas de anticipación</strong>. Al presionar "Cancelar hora" se enviará un mensaje con tu terapeuta automáticamente.
        </p>
      </div>

      {/* MODAL CANCELACIÓN */}
      {showCancel && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'0 20px'}}>
          <div style={{background:C.card,border:`1px solid ${col}40`,borderRadius:20,padding:'28px 24px',maxWidth:340,width:'100%',boxShadow:`0 20px 60px rgba(0,0,0,.5)`}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:C.text,fontWeight:700,textAlign:'center',marginBottom:10}}>¿Cancelar tu sesión?</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.muted,textAlign:'center',lineHeight:1.65,marginBottom:24}}>
              ¿Confirmas que quieres cancelar tu sesión? Se enviará un mensaje con el terapeuta automáticamente.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                style={{width:'100%',padding:'13px',borderRadius:11,border:'none',background:cancelling?'rgba(239,68,68,.4)':'rgba(239,68,68,.85)',color:'#fff',fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:cancelling?'default':'pointer'}}>
                {cancelling ? 'Enviando...' : 'Sí, cancelar mi sesión'}
              </button>
              <button
                onClick={()=>setShowCancel(false)}
                style={{width:'100%',padding:'13px',borderRadius:11,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SESIONES ANTERIORES */}
      {hist.length > 0 && <>
        <SLabel color={col}>Sesiones anteriores</SLabel>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {hist.map((h,i)=>(
            <Card key={i} style={{padding:'12px 14px'}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <PhotoSlot size={46} color={col} initials={h.init}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.text,fontWeight:700,marginBottom:2}}>{h.n}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:C.muted}}>{h.t}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <Stars n={h.s} color={col}/>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:C.muted,marginTop:3}}>{h.f}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>}
    </div>
  );
}

function TabAcompanamiento() {
  const col = C.magenta;
  const [playing,setPlaying] = useState('');
  const audios = [{id:1,label:'Buenos días, ¿cómo amaneciste hoy?',dur:'0:18',nuevo:true},{id:2,label:'Te cuento algo bonito que encontré...',dur:'0:24',nuevo:false},{id:3,label:'Pensé en ti hoy...',dur:'0:15',nuevo:false}];
  return <div style={{padding:'0 16px 24px'}}>
    <Card style={{marginBottom:16,background:`linear-gradient(160deg,${col}16 0%,#180D1E 100%)`,borderColor:col+'45',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-30,right:-30,width:160,height:160,borderRadius:'50%',background:`radial-gradient(circle,${col}10,transparent 70%)`}}/>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
        <div style={{flexShrink:0,position:'relative'}}>
          <div style={{width:70,height:70,borderRadius:'50%',background:`linear-gradient(135deg,${col}30,${col}10)`,border:`2px solid ${col}50`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 24px ${col}30`}}><Waveform color={col} w={38}/></div>
          <div style={{position:'absolute',bottom:2,right:2,background:C.green,width:16,height:16,borderRadius:'50%',border:`2.5px solid ${C.card}`,display:'flex',alignItems:'center',justifyContent:'center'}}><ICheck s={8} c="#fff"/></div>
        </div>
        <div style={{flex:1}}>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:3}}>Lupita</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:col,fontWeight:600,marginBottom:4}}>Tu compañera · siempre disponible</p>
          <div style={{display:'flex',alignItems:'center',gap:6}}><Dot color={C.green}/><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.green}}>En línea ahora</span></div>
        </div>
      </div>
      <div style={{background:col+'12',borderRadius:14,border:`1px solid ${col}25`,padding:'14px 16px',marginBottom:16}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:C.text,lineHeight:1.65,marginBottom:6}}>"Hola, soy Lupita. Estoy aquí para acompañarte, para escucharte y para platicar contigo cuando más lo necesites."</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.dim,lineHeight:1.6}}>"A veces uno solo necesita saber que hay alguien del otro lado. Aquí estoy."</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:col+'80',marginTop:8,textAlign:'right'}}>Lupita · ahora</p>
      </div>
      <button onClick={()=>window.open(`https://wa.me/${WA_SOPORTE}?text=${encodeURIComponent('Hola, soy usuaria de SaludCompartida y necesito ayuda con mi cuenta.')}`, '_blank')} style={{width:'100%',padding:'14px 0',borderRadius:13,border:'none',background:'linear-gradient(135deg,#10B981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',gap:12,cursor:'pointer',boxShadow:'0 8px 22px #10B98150'}}>
        <IWA/><span style={{color:'#fff',fontSize:17,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Escribir por WhatsApp</span>
      </button>
    </Card>
    <div style={{marginTop:16,borderRadius:14,overflow:'hidden',border:`1px solid ${col}30`,background:'#000'}}>
      <div style={{position:'relative',paddingBottom:'56.25%',height:0}}>
        <iframe
          src="https://www.youtube.com/embed/6s9wm8ttoVM?rel=0&modestbranding=1&playsinline=1"
          title="SaludCompartida — Acompañamiento"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
        />
      </div>
    </div>
   
    <img
      src="/SENIOR_CITIZEN.jpeg"
      alt="Familia feliz y sana"
      style={{width:'100%',height:'auto',display:'block',borderRadius:16,marginTop:12}}
    />
  </div>;
}

function TabAhorro() {
  const col = C.cyan;
  return <div style={{padding:'0 16px 24px'}}>
    {/* FOTO — ancho completo, altura natural */}

    {/* AHORRO — misma altura de referencia */}
    <Card style={{marginBottom:16,textAlign:'center',background:`linear-gradient(135deg,${col}18,${C.card})`,borderColor:col+'44',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',bottom:-20,right:-20,width:130,height:130,borderRadius:'50%',background:col+'0E'}}/>
      <p style={{color:C.dim,fontSize:13,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:6}}>Ahorro acumulado hoy</p>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:700,color:col,lineHeight:1,marginBottom:4}}>$0</p>
      <p style={{color:C.muted,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>pesos mexicanos · plan recién iniciado</p>
      <div style={{background:col+'14',border:`1px solid ${col}30`,borderRadius:12,padding:'10px 14px'}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:col,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:3}}>Proyectado a 4 meses</p>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:C.text,lineHeight:1}}>$7,500 MXN</p>
      </div>
    </Card>
    <Card style={{marginBottom:16}}>
      <SLabel color={col}>Tu ahorro proyectado mes a mes</SLabel>
      {[['Mes 1 — Mar 2026',1875,1875],['Mes 2 — Abr 2026',1875,3750],['Mes 3 — May 2026',1875,5625],['Mes 4 — Jun 2026',1875,7500]].map(([m,inc,acum]:any)=>(
        <div key={m} style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{color:C.dim,fontSize:18,fontFamily:"'DM Sans',sans-serif"}}>{m}</span>
            <div><span style={{color:col,fontSize:18,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>+${inc.toLocaleString()}</span><span style={{color:C.muted,fontSize:18,fontFamily:"'DM Sans',sans-serif",marginLeft:6}}>(total ${acum.toLocaleString()})</span></div>
          </div>
          <div style={{height:6,borderRadius:4,background:C.surface}}><div style={{height:'100%',borderRadius:4,width:`${(acum/7500)*100}%`,background:`linear-gradient(90deg,${col}60,${col})`}}/></div>
        </div>
      ))}
    </Card>
    <img
      src="/foto_familia_grande.jpeg"
      alt="Abuela y nieta"
      style={{width:'100%',height:'auto',display:'block',borderRadius:16,marginTop:12}}
    />
    <SLabel color={col}>Ahorro esperado por servicio</SLabel>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
      {[{n:'Telemedicina',desc:'~3 consultas/mes',esp:'$900 MXN',c:C.cyan},{n:'Terapia',desc:'~3 sesiones/mes',esp:'$750 MXN',c:C.indigo},{n:'Acompañamiento',desc:'Incluido en tu plan',esp:'Incluido',c:C.gold}].map((d,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
          <div><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,fontWeight:600}}>{d.n}</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,marginLeft:6}}>{d.desc}</span></div>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:d.c}}>{d.esp}</span>
        </div>
      ))}
    </div>
  </div>;
}

function TabOtros({onLogout}:any) {
  const [vista, setVista] = React.useState('menu');
  const [form, setForm] = React.useState({nombre:'',email:'',telefono:'',mensaje:''});
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [openSec, setOpenSec] = React.useState('');

  const handleSend = async () => {
    if(!form.nombre||!form.mensaje) return;
    setSending(true);
    try {
      await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nombre:form.nombre,email:form.email,telefono:form.telefono,mensaje:form.mensaje})});
    } catch(_){}
    setSending(false);
    setSent(true);
  };

  const goMenu = () => { setVista('menu'); setSent(false); setForm({nombre:'',email:'',telefono:'',mensaje:''}); setOpenSec(null); };

  const AcordBtn = ({id,titulo}:any) => (
    <button onClick={()=>setOpenSec((s)=>s===id?'':id)}
      style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.text,fontWeight:600}}>{titulo}</span>
      <IChevR s={14} c={C.muted} style={{transform:openSec!==''&&openSec===id?'rotate(90deg)':'none',transition:'transform 0.2s'}}/>
    </button>
  );

  const BackBtn = () => (
    <button onClick={goMenu} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',padding:'0 0 16px'}}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      <span style={{color:C.cyan,fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Volver</span>
    </button>
  );

  const Punto = ({color,texto}:any) => (
    <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:6}}>
      <div style={{width:7,height:7,borderRadius:'50%',background:color,flexShrink:0,marginTop:5}}/>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.dim,lineHeight:1.55}}>{texto}</span>
    </div>
  );

  const Nota = ({color,texto}:any) => (
    <div style={{background:color+'12',border:`1px solid ${color}30`,borderRadius:10,padding:'10px 12px',marginTop:10}}>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:color,lineHeight:1.6,margin:0}}>{texto}</p>
    </div>
  );

  const Acord = ({id,titulo,children}:any) => (
    <div style={{borderBottom:`1px solid ${C.border}`}}>
      <AcordBtn id={id} titulo={titulo}/>
      {openSec===id&&openSec!=='' && <div style={{paddingBottom:14}}>{children}</div>}
    </div>
  );

  // CONTACTO
  if (vista==='contacto') return (
    <div style={{padding:'16px 16px 32px'}}>
      <BackBtn/>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:4}}>Contáctanos</p>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,marginBottom:20}}>Te respondemos a la brevedad</p>
      {sent ? (
        <Card style={{textAlign:'center',padding:'32px 20px',borderColor:C.green+'50',background:C.green+'10'}}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 12px',display:'block'}}><polyline points="20 6 9 17 4 12"/></svg>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.text,fontWeight:700,marginBottom:6}}>Mensaje enviado</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.muted}}>Nos pondremos en contacto muy pronto.</p>
        </Card>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {(['nombre','email','telefono'] as any[]).map((key)=>{
            const labels:any = {nombre:'Tu nombre *',email:'Tu correo',telefono:'Tu teléfono'};
            const types:any  = {nombre:'text',email:'email',telefono:'tel'};
            const phs:any    = {nombre:'María García',email:'maria@gmail.com',telefono:'+52 55 1234 5678',telefono:'+1 305 439 8098'};
            return (
              <div key={key}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.dim,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{labels[key]}</p>
                <input type={types[key]} value={(form as any)[key]} onChange={(e)=>setForm((f)=>({...f,[key]:e.target.value}))} placeholder={phs[key]}
                  style={{width:'100%',boxSizing:'border-box',padding:'12px 14px',borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:'none'}}/>
              </div>
            );
          })}
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.dim,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Tu mensaje *</p>
            <textarea value={form.mensaje} onChange={(e)=>setForm((f)=>({...f,mensaje:e.target.value}))} placeholder="¿En qué podemos ayudarte?" rows={4}
              style={{width:'100%',boxSizing:'border-box',padding:'12px 14px',borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'vertical'}}/>
          </div>
          <button onClick={handleSend} disabled={sending||!form.nombre||!form.mensaje}
            style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:(!form.nombre||!form.mensaje)?C.border:`linear-gradient(135deg,${C.cyan},#0891B2)`,color:'#fff',fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:(!form.nombre||!form.mensaje)?'default':'pointer'}}>
            {sending?'Enviando...':'Enviar mensaje'}
          </button>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,textAlign:'center'}}>O escríbenos a contact@saludcompartida.com</p>
        </div>
      )}
    </div>
  );

  // PRIVACIDAD
  if (vista==='privacidad') return (
    <div style={{padding:'16px 16px 32px'}}>
      <BackBtn/>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:4}}>Política de Privacidad</p>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginBottom:16}}>Última actualización: Febrero 2026 · Tech Solution Services FVR LLC</p>
      <Card style={{marginBottom:16,borderColor:C.cyan+'30',background:C.cyan+'08'}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,lineHeight:1.7,margin:0}}>Tu privacidad es fundamental para nosotros. Aquí explicamos de forma clara cómo manejamos tu información.</p>
      </Card>
      <Card style={{padding:'4px 16px'}}>
        <Acord id="que" titulo="¿Qué datos recopilamos?">
          <Punto color={C.cyan} texto="Nombre, correo electrónico, teléfono y fecha de nacimiento"/>
          <Punto color={C.cyan} texto="Datos de tu familia en México: nombre, teléfono y fecha de nacimiento"/>
          <Punto color={C.cyan} texto="Información de uso: consultas médicas y llamadas con el acompañante de IA"/>
          <Punto color={C.cyan} texto="Datos de pago procesados de forma segura por Shopify Payments"/>
        </Acord>
        <Acord id="uso" titulo="¿Para qué usamos tus datos?">
          <Punto color={C.indigo} texto="Brindarte acceso a los servicios de salud contratados"/>
          <Punto color={C.indigo} texto="Contactarte sobre tu suscripción y novedades del servicio"/>
          <Punto color={C.indigo} texto="Mejorar la experiencia de SaludCompartida"/>
          <Punto color={C.indigo} texto="Cumplir con obligaciones legales en EE.UU. y México"/>
          <Nota color={C.green} texto="No vendemos ni compartimos tus datos personales con terceros con fines publicitarios."/>
        </Acord>
        <Acord id="compartir" titulo="¿Con quién compartimos tu información?">
          <Punto color={C.magenta} texto="NUEVO MÉTODO: solo los datos necesarios para coordinar tus consultas médicas"/>
          <Punto color={C.magenta} texto="Shopify Payments: para gestionar tu suscripción mensual"/>
          <Punto color={C.magenta} texto="Resend y WATI: para enviarte correos y mensajes de WhatsApp"/>
          <Nota color={C.gold} texto="Nunca compartimos tu información con anunciantes ni terceros no autorizados."/>
        </Acord>
        <Acord id="seguridad" titulo="¿Cómo protegemos tus datos?">
          <Punto color={C.green} texto="Cifrado en tránsito (HTTPS/TLS) y en reposo en todas nuestras bases de datos"/>
          <Punto color={C.green} texto="Row Level Security (RLS): cada usuario solo puede ver sus propios datos"/>
          <Punto color={C.green} texto="Grabaciones almacenadas en AWS S3 con acceso restringido y cifrado"/>
        </Acord>
        <Acord id="ia" titulo="Datos y el Acompañante de IA">
          <Punto color={C.cyan} texto="Las llamadas de Lupita o Fernanda pueden ser grabadas para mejorar el servicio"/>
          <Punto color={C.cyan} texto="Las grabaciones se guardan durante 12 meses con fines legales y de calidad"/>
          <Nota color={C.indigo} texto="Puedes solicitar eliminar tus grabaciones escribiendo a contact@saludcompartida.com"/>
        </Acord>
        <Acord id="derechos" titulo="Tus derechos">
          <Punto color={C.gold} texto="Acceder, corregir o eliminar tus datos personales"/>
          <Punto color={C.gold} texto="Oponerte al tratamiento de tus datos en ciertos casos"/>
          <Punto color={C.gold} texto="Presentar una queja ante autoridades de protección de datos"/>
          <Nota color={C.cyan} texto="Escríbenos a contact@saludcompartida.com con tu nombre y solicitud."/>
        </Acord>
      </Card>
    </div>
  );

  // TÉRMINOS
  if (vista==='terminos') return (
    <div style={{padding:'16px 16px 32px'}}>
      <BackBtn/>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:4}}>Términos y Condiciones</p>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginBottom:16}}>Última actualización: Febrero 2026 · Tech Solution Services FVR LLC</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        {[
          {t:'No es seguro médico',d:'Conectamos con doctores. No somos hospital ni aseguradora.',c:C.magenta},
          {t:'Pagas mensual',d:'$12–18 USD/mes. Cancela cuando quieras.',c:C.cyan},
          {t:'Hasta 4 personas',d:'Tu suscripción cubre a tu familia en México.',c:C.indigo},
          {t:'Servicio en México',d:'Los doctores están en México. Emergencias: llama al 911.',c:C.gold},
        ].map((k,i)=>(
          <div key={i} style={{background:k.c+'10',border:`1px solid ${k.c}30`,borderRadius:12,padding:'12px'}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:k.c,fontWeight:700,marginBottom:4}}>{k.t}</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,lineHeight:1.5,margin:0}}>{k.d}</p>
          </div>
        ))}
      </div>
      <Card style={{padding:'4px 16px'}}>
        <Acord id="incluye" titulo="¿Qué incluye mi suscripción?">
          <Punto color={C.green} texto="Consultas médicas ilimitadas por videollamada o chat, 24/7"/>
          <Punto color={C.green} texto="Una sesión semanal de terapia psicológica"/>
          <Punto color={C.green} texto="Acompañante de IA (Lupita o Fernanda) incluido en todos los planes"/>
          <Nota color={C.gold} texto="No cubre emergencias graves ni hospitalizaciones. En emergencia llama al 911."/>
        </Acord>
        <Acord id="quienes" titulo="¿Quiénes participan?">
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.dim,lineHeight:1.65,marginBottom:10}}>SaludCompartida (Tech Solution Services FVR LLC, Florida) es la plataforma tecnológica. NUEVO MÉTODO es la empresa mexicana independiente que entrega los servicios de salud.</p>
          <Nota color={C.muted} texto="Son empresas independientes. Cada una tiene su responsabilidad propia."/>
        </Acord>
        <Acord id="pago" titulo="¿Cómo funciona el pago?">
          <Punto color={C.cyan} texto="Pagas en dólares (USD) desde Estados Unidos, mensual y automático"/>
          <Punto color={C.cyan} texto="Los primeros 30 días son gratuitos — el primer cobro al mes de activar"/>
          <Punto color={C.cyan} texto="Si subimos el precio, te avisamos con anticipación"/>
        </Acord>
        <Acord id="cancelar" titulo="¿Cómo cancelo?">
          <Punto color={C.magenta} texto="Desde tu cuenta en saludcompartida.shop"/>
          <Punto color={C.magenta} texto="Escribiéndonos a contact@saludcompartida.com"/>
          <Nota color={C.gold} texto="Borrar la app NO cancela la suscripción. Debes cancelarla directamente."/>
        </Acord>
        <Acord id="reembolso" titulo="¿Puedo pedir un reembolso?">
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.dim,lineHeight:1.65}}>Tienes 48 horas después del primer cobro para pedir devolución completa, siempre que no hayan usado servicios. Los pagos siguientes no se reembolsan salvo error nuestro.</p>
        </Acord>
        <Acord id="ley" titulo="Ley aplicable">
          <Punto color={C.muted} texto="Estos términos se rigen por las leyes del Estado de Florida, EE.UU."/>
          <Nota color={C.cyan} texto="¿Dudas? Escríbenos a contact@saludcompartida.com"/>
        </Acord>
      </Card>
    </div>
  );

  // MENÚ PRINCIPAL
  return (
    <div style={{padding:'16px 16px 32px'}}>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[
          {label:'Contáctanos',           sub:'Envíanos un mensaje',            v:'contacto'},
          {label:'Política de Privacidad',sub:'Cómo protegemos tus datos',      v:'privacidad'},
          {label:'Términos y Condiciones',sub:'Condiciones del servicio',        v:'terminos'},
        ].map((item,i)=>(
          <button key={i} onClick={()=>setVista(item.v)}
            style={{width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',textAlign:'left'}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,color:C.text,fontWeight:600,margin:'0 0 3px'}}>{item.label}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:0}}>{item.sub}</p>
            </div>
            <IChevR s={14} c={C.muted}/>
          </button>
        ))}
        <button onClick={onLogout}
          style={{width:'100%',background:C.card,border:'1px solid #EF444430',borderRadius:14,padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',textAlign:'left',marginTop:4}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,color:'#EF4444',fontWeight:600,margin:'0 0 3px'}}>Cerrar sesión</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,margin:0}}>Salir de tu cuenta</p>
          </div>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,textAlign:'center',marginTop:32,lineHeight:1.7}}>
        SaludCompartida · contact@saludcompartida.com<br/>+1 786 964 8040
      </p>
    </div>
  );
}


function TabCuenta({user,onLogout}:any) {
  const col = C.gold;
  const nombreCompleto = user?.userName||'—';
  const codigo         = user?.code||'------';
  const familyCode     = user?._code||user?.code||'';
  const plan           = user?.benefits||'Plan Familiar';
  const email          = user?.email||'—';
  const telefono       = user?.phone||'—';
  const migrantName    = user?.migrantName||'';
  const initiales = nombreCompleto.split(' ').map((p)=>p[0]||'').slice(0,2).join('').toUpperCase();
  const [usuarios,setUsuarios] = useState([]);
  const [modal,setModal]       = useState(false);
  const [form,setForm]         = useState({nombre:'',parentesco:'Mamá'});
  const [editando,setEditando] = useState(false);
  const [editForm,setEditForm] = useState({nombre:nombreCompleto,telefono:telefono,email:email});
  const [saving,setSaving]     = useState(false);
  const [saveOk,setSaveOk]     = useState(false);
  const [saveErr,setSaveErr]   = useState('');
  const [loadingMembers,setLoadingMembers] = useState(false);
  const [addingMember,setAddingMember]     = useState(false);

  // Cargar miembros desde Supabase al montar
  useEffect(()=>{
    if(!familyCode) return;
    setLoadingMembers(true);
    fetch(FAMILY_MEMBERS_URL,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'list',family_code:familyCode})})
      .then(r=>r.json())
      .then(data=>{
        if(data.ok && data.members){
          setUsuarios(data.members.map((m)=>({
            id: m.id,
            nombre: m.nombre,
            parentesco: m.parentesco,
            init: m.nombre.split(' ').map((p)=>p[0]||'').slice(0,2).join('').toUpperCase(),
          })));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoadingMembers(false));
  },[familyCode]);

  async function agregar(){
    if(!form.nombre.trim()||usuarios.length>=3) return;
    setAddingMember(true);
    try {
      const res = await fetch(FAMILY_MEMBERS_URL,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'add',family_code:familyCode,nombre:form.nombre.trim(),parentesco:form.parentesco})});
      const data = await res.json();
      if(data.ok && data.member){
        const m = data.member;
        setUsuarios(prev=>[...prev,{id:m.id,nombre:m.nombre,parentesco:m.parentesco,init:m.nombre.split(' ').map((p)=>p[0]||'').slice(0,2).join('').toUpperCase()}]);
        setForm({nombre:'',parentesco:'Mamá'});
        setModal(false);
      }
    } catch(_){}
    setAddingMember(false);
  }

  async function eliminarMiembro(idx:number){
    const u = usuarios[idx];
    if(u.id){
      try {
        await fetch(FAMILY_MEMBERS_URL,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'remove',family_code:familyCode,member_id:u.id})});
      } catch(_){}
    }
    setUsuarios(prev=>prev.filter((_,j)=>j!==idx));
  }

  async function guardarCambios() {
    if(saving) return;
    setSaving(true); setSaveOk(false); setSaveErr('');
    try {
      const res = await fetch(UPDATE_PROFILE, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          family_code:       familyCode,
          family_first_name: editForm.nombre.split(' ')[0]||editForm.nombre,
          family_last_name:  editForm.nombre.split(' ').slice(1).join(' ')||'',
          family_phone:      editForm.telefono,
          family_email:      editForm.email,
        }),
      });
      const data = await res.json();
      if(!data.ok) throw new Error(data.error||'Error al guardar');
      setSaveOk(true);
      setEditando(false);
      setTimeout(()=>setSaveOk(false), 3000);
    } catch(e:any) {
      setSaveErr(e.message||'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const bens=['Telemedicina 24/7 ilimitada','Terapia semanal incluida','Acompañamiento AI personalizado','Historial médico digital'];

  return <div style={{padding:'0 16px 24px'}}>
    {/* HEADER */}
    <Card style={{marginBottom:16,textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:58,background:`linear-gradient(135deg,${col}1E,${col}06)`}}/>
      <div style={{width:76,height:76,borderRadius:'50%',margin:'8px auto 12px',background:col+'1E',border:`2px solid ${col}55`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
        <span style={{color:col,fontSize:22,fontWeight:800,fontFamily:"'DM Sans',sans-serif"}}>{initiales}</span>
        <span style={{position:'absolute',bottom:0,right:0,width:20,height:20,borderRadius:'50%',background:C.green,border:`2.5px solid ${C.card}`,display:'flex',alignItems:'center',justifyContent:'center'}}><ICheck s={9} c="#fff"/></span>
      </div>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:2}}>{nombreCompleto}</p>
      <p style={{color:C.muted,fontSize:18,fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>Código: {codigo}</p>
      <Badge color={col}>{plan}</Badge>
      {migrantName&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:C.dim,marginTop:12,lineHeight:1.5}}>Plan activo gracias a <strong style={{color:col}}>{migrantName}</strong></p>}
    </Card>

    {/* USUARIOS ADICIONALES */}
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><IUsers s={15} c={col}/><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:col}}>Usuarios adicionales</span></div>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.muted}}>{usuarios.length} / 3</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {usuarios.map((u,i)=>(
          <Card key={i} style={{padding:'13px 15px',borderColor:u.activo?col+'55':C.border}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <PhotoSlot size={50} color={col} initials={u.init}/>
              <div style={{flex:1}}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:C.text,fontWeight:700,marginBottom:2}}>{u.nombre}</p><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:col}}>{u.parentesco}</p></div>
              <button onClick={()=>eliminarMiembro(i)} style={{background:'transparent',border:'none',cursor:'pointer',padding:6,borderRadius:8}}><ITrash s={15} c="#EF4444AA"/></button>
            </div>
          </Card>
        ))}
        {Array.from({length:3-usuarios.length},(_,i)=>(
          <button key={i} onClick={()=>setModal(true)} style={{width:'100%',padding:'14px',borderRadius:16,border:`1.5px dashed ${col}40`,background:col+'08',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:50,height:50,borderRadius:'50%',background:col+'12',border:`1.5px dashed ${col}50`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IPlus s={20} c={col+'99'}/></div>
            <div style={{textAlign:'left'}}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:col+'CC',fontWeight:600,marginBottom:2}}>Agregar familiar</p><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.muted}}>{3-usuarios.length-i} {3-usuarios.length-i===1?'lugar disponible':'lugares disponibles'}</p></div>
          </button>
        ))}
      </div>
    </div>

    {/* PLAN */}
    <Card style={{marginBottom:16,borderColor:col+'28'}}>
      <SLabel color={col}>Tu plan incluye</SLabel>
      {bens.map((b,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<bens.length-1?10:0}}>
          <div style={{width:22,height:22,borderRadius:'50%',background:col+'1E',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ICheck s={10} c={col}/></div>
          <span style={{color:C.text,fontSize:17,fontFamily:"'DM Sans',sans-serif"}}>{b}</span>
        </div>
      ))}
    </Card>

    {/* INFORMACIÓN / EDICIÓN */}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
      <SLabel color={col}>Información</SLabel>
      {!editando && (
        <button onClick={()=>{setEditando(true);setEditForm({nombre:nombreCompleto,telefono:telefono,email:email});setSaveErr('');}}
          style={{background:col+'15',border:`1px solid ${col}40`,borderRadius:8,padding:'5px 12px',color:col,fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',letterSpacing:'0.05em'}}>
          Editar
        </button>
      )}
    </div>

    {saveOk && (
      <div style={{background:C.green+'15',border:`1px solid ${C.green}40`,borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
        <ICheck s={14} c={C.green}/><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,fontWeight:600}}>¡Datos guardados correctamente!</span>
      </div>
    )}
    {saveErr && (
      <div style={{background:'#EF444415',border:'1px solid #EF444440',borderRadius:10,padding:'10px 14px',marginBottom:12}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#EF4444'}}>{saveErr}</span>
      </div>
    )}

    {editando ? (
      <Card style={{marginBottom:16}}>
        {[
          {label:'Nombre completo',key:'nombre',type:'text',placeholder:'Tu nombre'},
          {label:'Teléfono (WhatsApp)',key:'telefono',type:'tel',placeholder:'+52 55 1234 5678'},
          {label:'Correo electrónico',key:'email',type:'email',placeholder:'tu@correo.com'},
        ].map(({label,key,type,placeholder})=>(
          <div key={key} style={{marginBottom:12}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</p>
            <input type={type} value={(editForm as any)[key]} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}
              placeholder={placeholder}
              style={{width:'100%',boxSizing:'border-box',padding:'11px 14px',borderRadius:10,border:`1px solid ${col}50`,background:C.surface,color:C.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:'none'}}/>
          </div>
        ))}
        <div style={{display:'flex',gap:10,marginTop:4}}>
          <button onClick={()=>setEditando(false)} style={{flex:1,padding:'12px',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.dim,fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Cancelar</button>
          <button onClick={guardarCambios} disabled={saving}
            style={{flex:2,padding:'12px',borderRadius:10,border:'none',background:saving?col+'60':`linear-gradient(135deg,${col},#D97B20)`,color:'#000',fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:saving?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {saving?'Guardando...':'Guardar cambios'}
          </button>
        </div>
      </Card>
    ) : (
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
        {[['Nombre',nombreCompleto],['Teléfono',telefono],['Email',email],['Código de acceso',codigo],['Plan activo',plan]].map(([k,v])=>(
          <Card key={k} style={{padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:C.muted,fontSize:18,fontFamily:"'DM Sans',sans-serif"}}>{k}</span>
            <span style={{color:C.text,fontSize:17,fontWeight:600,fontFamily:"'DM Sans',sans-serif",maxWidth:'55%',textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</span>
          </Card>
        ))}
      </div>
    )}

    {/* MODAL AGREGAR FAMILIAR */}
    {modal&&(
      <div style={{position:'fixed',inset:0,background:'#000000CC',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:999,backdropFilter:'blur(6px)'}} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
        <div style={{width:'100%',maxWidth:520,background:C.surface,borderRadius:'24px 24px 0 0',padding:'28px 24px 40px',border:`1px solid ${C.border}`,borderBottom:'none'}}>
          <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 24px'}}/>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,marginBottom:4}}>Agregar familiar</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.dim,marginBottom:24}}>Hasta 3 personas adicionales en su plan</p>
          <div style={{marginBottom:16}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.muted,marginBottom:6,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase'}}>Nombre completo</p>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej. Rosa González Pérez" style={{width:'100%',padding:'13px 16px',borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:17,fontFamily:"'DM Sans',sans-serif",outline:'none'}}/>
          </div>
          <div style={{marginBottom:24}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.muted,marginBottom:8,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase'}}>Parentesco</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {PARENTESCOS.map(p=>(
                <button key={p} onClick={()=>setForm({...form,parentesco:p})} style={{padding:'8px 14px',borderRadius:20,border:`1px solid ${form.parentesco===p?col:C.border}`,background:form.parentesco===p?col+'22':C.card,color:form.parentesco===p?col:C.dim,fontSize:17,fontWeight:form.parentesco===p?700:400,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',transition:'all 0.18s'}}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setModal(false)} style={{flex:1,padding:'14px 0',borderRadius:12,border:`1px solid ${C.border}`,background:'transparent',color:C.dim,fontSize:17,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Cancelar</button>
            <button onClick={agregar} disabled={!form.nombre.trim()||addingMember} style={{flex:2,padding:'14px 0',borderRadius:12,border:'none',background:form.nombre.trim()?`linear-gradient(135deg,${col},#D97B20)`:C.border,color:form.nombre.trim()?'#000':'#666',fontSize:17,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:form.nombre.trim()?'pointer':'not-allowed',transition:'all 0.2s'}}>{addingMember?'Guardando...':'Agregar familiar'}</button>
          </div>
        </div>
      </div>
    )}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// WELCOME
// ═══════════════════════════════════════════════════════════════
function WelcomeScreen({userData,onEnter}:any) {
  const profile=userData?.profile||{};
  const subscription=userData?.subscription||{};
  const col=C.cyan;
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center'}}>
    <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${col}28,${col}0C)`,border:`1.5px solid ${col}50`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:28,boxShadow:`0 0 40px ${col}25`}}>
      <span style={{color:col,fontSize:22,fontWeight:800,letterSpacing:'-1px',fontFamily:"'DM Sans',sans-serif"}}>SC</span>
    </div>
    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:col,fontWeight:700,letterSpacing:'0.14em',marginBottom:12}}>BIENVENIDA A TU SALUD</p>
    <p style={{fontFamily:"'Playfair Display',serif",fontSize:30,color:C.text,fontWeight:700,lineHeight:1.25,marginBottom:20,maxWidth:320}}>
      Hola, <span style={{color:col}}>{profile.first_name||'amiga'}</span>
    </p>
    <div style={{background:`linear-gradient(135deg,${col}14,${C.card})`,border:`1px solid ${col}35`,borderRadius:20,padding:'22px 24px',marginBottom:28,maxWidth:360,width:'100%'}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:col+'1E',border:`1.5px solid ${col}45`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><IHeart s={20} c={col} fill={col+'40'}/></div>
      {profile.migrant_first_name?(
        <>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,lineHeight:1.35,marginBottom:10}}>Gracias a <span style={{color:col}}>{profile.migrant_first_name}</span>,<br/>tienes acceso a todos<br/>los beneficios de salud</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:C.dim,lineHeight:1.65}}>Tu ser querido en los Estados Unidos te ha dado el regalo más valioso: cuidar tu salud.</p>
        </>
      ):<p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,fontWeight:700,lineHeight:1.35}}>Tu familia te ha dado acceso a todos los beneficios de salud</p>}
    </div>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:32}}><Dot color={col}/><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:col,fontWeight:600}}>{subscription.plan_type||'Plan Familiar'} · Activo</span></div>
    <button onClick={onEnter} style={{width:'100%',maxWidth:320,padding:'17px 0',borderRadius:14,border:'none',background:`linear-gradient(135deg,${col},#0891B2)`,color:'#fff',fontSize:18,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',boxShadow:`0 10px 30px ${col}45`}}>Ver mis beneficios</button>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({userData,onLogout}:any) {
  const [active,setActive] = useState('doctor');
  const scrollRef = useRef(null);
  const tab   = TABS.find(t=>t.id===active);
  const accent = tab?.color||C.cyan;
  const displayName = userData?.profile?.first_name||'';
  const initials = displayName?displayName.split(' ').map((p)=>p[0]||'').slice(0,2).join('').toUpperCase():'SC';
  const cuentaUser = {
    userName:`${userData?.profile?.first_name||''} ${userData?.profile?.last_name||''}`.trim(),
    code:userData?._code||'',
    benefits:userData?.subscription?.plan_type||'Plan Familiar',
    email:userData?.profile?.email||'',
    phone:userData?.profile?.phone||'',
    migrantName:`${userData?.profile?.migrant_first_name||''} ${userData?.profile?.migrant_last_name||''}`.trim(),
  };
  function go(id:string){if(id===active)return;setActive(id);if(scrollRef.current)scrollRef.current.scrollTop=0;}
  // Exponer userData globalmente para que los tabs accedan al family_code
  if(typeof window !== 'undefined')(window as any).__SC_USER__ = userData;
  const screens:any={doctor:<TabDoctor/>,terapia:<TabTerapia/>,acompanamiento:<TabAcompanamiento/>,ahorro:<TabAhorro/>,cuenta:<TabCuenta user={cuentaUser} onLogout={onLogout}/>,otros:<TabOtros onLogout={onLogout}/>};
  return <div className="sc-desk-bg">
    <div className="sc-shell" style={{width:'100%',maxWidth:680,background:C.bg,display:'flex',flexDirection:'column',height:'100dvh',minHeight:'-webkit-fill-available'}}>
      <div style={{background:'#0D1B2A',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px 8px'}}>
          <div style={{display:'flex',alignItems:'center'}}>
            <img src="/LOGO_DARK_FONDO_AZUL.png" alt="SaludCompartida" style={{height:40,width:'auto',display:'block',filter:'brightness(1.25) saturate(1.4) contrast(1.1)',mixBlendMode:'screen'}}/>
          </div>
          <div style={{padding:'4px 10px',borderRadius:20,background:accent+'15',border:`1px solid ${accent}38`,display:'flex',alignItems:'center',gap:6}}><Dot color={accent}/><span style={{color:accent,fontSize:11,fontWeight:700,letterSpacing:'0.08em'}}>ACTIVA</span></div>
        </div>
        <NavBar active={active} onNav={go} position="top"/>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:'auto',paddingTop:16}}>
        <div className="sc-tc" key={active}>{screens[active]}</div>
      </div>
      <div style={{flexShrink:0,position:'sticky',bottom:0,zIndex:50,background:'#0D1B2A'}}><NavBar active={active} onNav={go} position="bottom"/></div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// LANDING
// ═══════════════════════════════════════════════════════════════
function Landing({onSuccess}:any) {
  const [codigo,setCodigo]   = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState('');
  const [visible,setVisible]     = useState(false);
  const [helpLoading,setHelpL]   = useState(false);
  const [helpSent,setHelpSent]   = useState(false);
  const [masInfo,setMasInfo]     = useState(false);
  useEffect(()=>{setTimeout(()=>setVisible(true),100);},[]);

  const handleHelp = async () => {
    if(helpLoading||helpSent) return;
    setHelpL(true);
    try {
      await fetch(CODE_NOT_WORKING,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code_entered:codigo})});
    } catch(_){}
    setHelpL(false);
    setHelpSent(true);
  };

  const handleActivar = async () => {
    if(!codigo.trim()){setError('Por favor ingresa tu código de acceso');return;}
    if(codigo.length<6){setError('El código debe tener 6 caracteres');return;}
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(VALIDATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:codigo.toUpperCase().trim()})});
      const data = await res.json();
      if(data.valid){data._code=codigo.toUpperCase().trim();onSuccess(data);}
      else{setError(data.error||'Código no encontrado. Verifica e intenta de nuevo.');}
    } catch(e) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fade=(delay)=>({opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(14px)',transition:`all 0.5s ease ${delay}`});

  return <div style={{minHeight:'100vh',backgroundColor:'#080f1a',fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",color:'#fff',overflowX:'hidden'}}>

    {/* ── HERO — solo el gancho emocional, sin código ── */}
    <div style={{background:'linear-gradient(170deg,#050a12 0%,#0a1628 60%,#0d1a2e 100%)',padding:'28px 24px 64px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      {/* Logo */}
      <div style={{position:'absolute',top:'20px',left:'24px',zIndex:10}}>
        <img src="/saludcompartida-dark-no-tagline.png" alt="SaludCompartida" style={{height:'40px',objectFit:'contain'}}/>
      </div>
      <div style={{position:'absolute',top:'-80px',left:'50%',transform:'translateX(-50%)',width:'600px',height:'350px',background:'radial-gradient(ellipse,rgba(236,72,153,0.12) 0%,transparent 65%)',pointerEvents:'none'}}/>

      {/* Ícono corazón */}
      <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'80px',height:'80px',borderRadius:'24px',background:'linear-gradient(135deg,rgba(236,72,153,0.22),rgba(236,72,153,0.06))',border:'1px solid rgba(236,72,153,0.4)',marginBottom:'28px',marginTop:'68px',opacity:visible?1:0,transform:visible?'scale(1)':'scale(0.85)',transition:'all 0.65s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <IHeart s={38} c="#EC4899" fill="rgba(236,72,153,0.18)"/>
      </div>

      <p style={{fontSize:'14px',letterSpacing:'3px',textTransform:'uppercase',color:'#EC4899',fontWeight:'700',marginBottom:'20px',...fade('0.15s')}}>
        Alguien que te quiere te regaló esto
      </p>
      <h1 style={{fontSize:'clamp(34px,9vw,58px)',fontWeight:'800',lineHeight:'1.1',marginBottom:'24px',...fade('0.25s')}}>
        <span style={{background:'linear-gradient(135deg,#ffffff 0%,#fce7f3 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Cada familia<br/>es una historia,<br/></span>
        <span style={{background:'linear-gradient(135deg,#06B6D4 0%,#EC4899 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>la tuya empieza aquí.</span>
      </h1>
      <p style={{fontSize:'19px',lineHeight:'1.75',color:'#e2e8f0',maxWidth:'400px',margin:'0 auto 0',...fade('0.35s')}}>
        Ya no tienes que madrugar para un turno.<br/>Ya no tienes que esperar meses.<br/>Ya tienes doctor, <span style={{color:'#67e8f9',fontWeight:'700'}}>ahora mismo.</span>
      </p>
    </div>

    {/* ── LO QUE YA NO TIENES QUE VIVIR ── */}
    <div style={{background:'linear-gradient(180deg,#060d18 0%,#080f1a 100%)',padding:'56px 24px 56px',textAlign:'center'}}>
      <p style={{fontSize:'13px',letterSpacing:'3px',textTransform:'uppercase',color:'#475569',fontWeight:'600',marginBottom:'14px'}}>Esto cambia hoy</p>
      <h2 style={{fontSize:'clamp(28px,6vw,42px)',fontWeight:'800',color:'#ffffff',lineHeight:'1.15',marginBottom:'14px'}}>Lo que ya no tienes<br/>que volver a vivir</h2>
      <p style={{color:'#94a3b8',fontSize:'17px',maxWidth:'420px',margin:'0 auto 44px',lineHeight:'1.6'}}>Millones de familias en México lo sufren cada día. Tú ya no.</p>
      <div style={{maxWidth:'700px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'16px'}}>
        {[
          ['Madrugar a las 5 AM para un turno',           'Consulta en minutos, desde tu casa',      '#34D399'],
          ['Esperar 6 meses para ver un especialista',     'Médico disponible hoy, sin cita previa',  '#34D399'],
          ['4 horas de fila para que el doctor no llegue', 'Tu tiempo vale — atención garantizada',   '#34D399'],
          ['Sentirte sola cuando te sientes mal',          'Tienes a alguien que te llama y escucha', '#EC4899'],
        ].map(([pain,fix,col],i)=>(
          <div key={i} style={{background:'linear-gradient(135deg,rgba(15,25,45,0.9),rgba(8,15,30,0.9))',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'24px 22px',textAlign:'left'}}>
            <p style={{fontSize:'16px',color:'#64748b',textDecoration:'line-through',marginBottom:'10px',lineHeight:'1.55'}}>{pain}</p>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p style={{fontSize:'17px',fontWeight:'700',color:col,lineHeight:'1.5'}}>{fix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── CIERRE EMOCIONAL ── */}
    <div style={{padding:'48px 24px 0',textAlign:'center',background:'#080f1a'}}>
      <div style={{maxWidth:'480px',margin:'0 auto',background:'linear-gradient(145deg,#0f1e38,#0a1528)',borderRadius:'24px',padding:'40px 32px',border:'1px solid rgba(236,72,153,0.2)',boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}>
        <p style={{fontSize:'13px',letterSpacing:'2px',textTransform:'uppercase',color:'#EC4899',fontWeight:'700',marginBottom:'18px'}}>Esto no fue casualidad</p>
        <p style={{fontSize:'19px',lineHeight:'1.8',color:'#e2e8f0',fontStyle:'italic',marginBottom:'0'}}>&quot;Alguien que trabaja lejos, que extraña estar contigo, que se desvela pensando en tu salud — decidió que merecías lo mejor.<br/><br/><span style={{color:'#f9a8d4',fontStyle:'normal',fontWeight:'700'}}>Ese regalo ya es tuyo. Actívalo abajo.</span>&quot;</p>
      </div>
    </div>

    {/* ── QUIERO CONTRATAR AHORA ── */}
    <div style={{padding:'32px 24px 0',background:'#080f1a',textAlign:'center'}}>
      <div style={{maxWidth:'440px',margin:'0 auto'}}>
        <p style={{fontSize:'13px',letterSpacing:'3px',textTransform:'uppercase',color:'#06B6D4',fontWeight:'700',marginBottom:'14px'}}>¿Aún no tienes tu plan?</p>
        <button onClick={()=>window.open('https://saludcompartida.shop','_blank')}
          style={{width:'100%',padding:'20px',fontSize:'17px',fontWeight:'800',borderRadius:'16px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#06B6D4 0%,#0891B2 100%)',color:'#fff',boxShadow:'0 10px 32px rgba(6,182,212,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'12px'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Quiero contratar ahora
        </button>
        <p style={{fontSize:'13px',color:'#475569',marginBottom:'0'}}>Primeros 30 días gratis · Solo $12 USD/mes después</p>
      </div>
    </div>

    {/* ── CÓDIGO DE ACCESO — AL FINAL ── */}
    <div style={{padding:'48px 24px 64px',background:'#080f1a'}} id="activar">
      <div style={{maxWidth:'440px',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <p style={{fontSize:'13px',letterSpacing:'3px',textTransform:'uppercase',color:'#EC4899',fontWeight:'700',marginBottom:'10px'}}>¿Ya tienes tu código?</p>
          <h2 style={{fontSize:'clamp(26px,6vw,36px)',fontWeight:'800',color:'#ffffff',lineHeight:'1.2',marginBottom:'10px'}}>Activa tu acceso ahora</h2>
          <p style={{fontSize:'16px',color:'#94a3b8',lineHeight:'1.6'}}>Tu código de 6 caracteres llegó por WhatsApp o correo</p>
        </div>
        <div style={{background:'linear-gradient(145deg,#0f1e38,#0a1528)',borderRadius:'24px',padding:'36px 28px',border:'1px solid rgba(236,72,153,0.25)',boxShadow:'0 0 60px rgba(236,72,153,0.08),0 24px 48px rgba(0,0,0,0.6)',position:'relative'}}>
          <div style={{position:'absolute',top:0,left:'28px',right:'28px',height:'2px',background:'linear-gradient(90deg,transparent,#EC4899,#06B6D4,transparent)',borderRadius:'2px'}}/>
          <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#64748b',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',textAlign:'center'}}>Tu código de acceso</label>
          <input type="text" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&handleActivar()} placeholder="Ej: A3B7K9" maxLength={6}
            style={{width:'100%',boxSizing:'border-box',padding:'20px',fontSize:'24px',fontWeight:'800',letterSpacing:'6px',textAlign:'center',backgroundColor:'rgba(255,255,255,0.04)',border:error?'2px solid #f87171':'2px solid rgba(236,72,153,0.3)',borderRadius:'16px',color:'#ffffff',outline:'none',caretColor:'#EC4899',transition:'border-color 0.2s'}}
            onFocus={e=>{const t=e.target as HTMLInputElement;t.style.borderColor='#EC4899';t.style.boxShadow='0 0 0 4px rgba(236,72,153,0.12)';}}
            onBlur={e=>{const t=e.target as HTMLInputElement;t.style.borderColor=error?'#f87171':'rgba(236,72,153,0.3)';t.style.boxShadow='none';}}
          />
          {error&&<p style={{color:'#f87171',fontSize:'14px',marginTop:'10px',textAlign:'center',fontWeight:'600'}}>{error}</p>}
          <button onClick={handleActivar} disabled={loading}
            style={{width:'100%',marginTop:'20px',padding:'20px',fontSize:'17px',fontWeight:'800',borderRadius:'16px',border:'none',cursor:loading?'default':'pointer',background:loading?'rgba(236,72,153,0.4)':'linear-gradient(135deg,#EC4899 0%,#be185d 100%)',color:'#fff',boxShadow:loading?'none':'0 10px 32px rgba(236,72,153,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',transition:'all 0.2s'}}>
            {loading?(
              <><svg width="22" height="22" viewBox="0 0 20 20" style={{animation:'spin 1s linear infinite'}}><circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M10 2a8 8 0 0 1 8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>Verificando tu código...</>
            ):(
              <><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 10l5 5 9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Activar mi Acceso</>
            )}
          </button>
        </div>
      </div>

      {/* ── DOS BOTONES INFERIORES ── */}
      <div style={{display:'flex',gap:10,marginTop:24}}>

        {/* Más Información */}
        <button onClick={()=>setMasInfo((v)=>!v)}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'13px 12px',borderRadius:14,border:`1.5px solid ${masInfo?'#06B6D4':'rgba(6,182,212,0.4)'}`,background:masInfo?'rgba(6,182,212,0.15)':'rgba(6,182,212,0.06)',cursor:'pointer',transition:'all 0.2s'}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{fontSize:'13px',fontWeight:'700',color:'#06B6D4',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>Más Información</span>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:masInfo?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Mi Código no funciona */}
        <button onClick={handleHelp} disabled={helpLoading||helpSent}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'13px 12px',borderRadius:14,border:`1.5px solid ${helpSent?'rgba(52,211,153,0.4)':'rgba(236,72,153,0.4)'}`,background:helpSent?'rgba(52,211,153,0.08)':'rgba(236,72,153,0.06)',cursor:helpSent?'default':'pointer',transition:'all 0.2s'}}>
          {helpSent ? (
            <>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{fontSize:'13px',fontWeight:'700',color:'#34D399',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>¡Enviado!</span>
            </>
          ) : (
            <>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{fontSize:'13px',fontWeight:'700',color:'#EC4899',fontFamily:"'DM Sans',sans-serif",lineHeight:1.2,textAlign:'left'}}>
                {helpLoading?'Enviando...':'Mi Código no funciona'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── PANEL MÁS INFORMACIÓN — se despliega inline ── */}
      {masInfo && (
        <div style={{marginTop:16,borderRadius:20,overflow:'hidden',border:'1px solid rgba(6,182,212,0.25)',background:'linear-gradient(180deg,#0c1a30 0%,#060d18 100%)'}}>
          <div style={{padding:'28px 24px'}}>
            <p style={{fontSize:'11px',letterSpacing:'3px',textTransform:'uppercase',color:'#EC4899',fontWeight:'700',marginBottom:10,textAlign:'center'}}>Tu nuevo servicio</p>
            <h3 style={{fontSize:'24px',fontWeight:'800',color:'#fff',lineHeight:1.2,marginBottom:6,textAlign:'center',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Todo lo que ahora<br/><span style={{background:'linear-gradient(135deg,#06B6D4,#EC4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>tienes a tu alcance</span>
            </h3>
            <p style={{color:'#64748b',fontSize:'14px',textAlign:'center',marginBottom:24,lineHeight:1.5}}>Sin filas. Sin burocracia. Sin gastar de más.</p>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                {accent:'#06B6D4',title:'Doctor ahora mismo',badge:'Ilimitado · 24/7',desc:'Médicos certificados por videollamada o chat, cualquier día, a cualquier hora. Sin filas ni traslado.'},
                {accent:'#818CF8',title:'Terapia para ti',badge:'1 sesión/semana',desc:'Una sesión semanal con psicólogo certificado. Tu salud mental importa tanto como tu salud física.'},
                {accent:'#EC4899',title:'Lupita te llama',badge:'Tu compañera de IA',desc:'Lupita o Fernanda te llaman para saber cómo estás. No estás sola. Alguien siempre está pendiente de ti.'},
                {accent:'#7CB69D',title:'Tu tiempo, respetado',badge:'Sin esperas',desc:'Atención inmediata. Nunca más perder el día en una clínica. Tú decides cuándo y desde dónde.'},
              ].map((b,i)=>(
                <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{width:38,height:38,borderRadius:12,background:`${b.accent}20`,border:`1px solid ${b.accent}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:b.accent}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:'15px',fontWeight:'800',color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{b.title}</span>
                      <span style={{fontSize:'11px',fontWeight:'700',padding:'2px 8px',borderRadius:20,background:`${b.accent}18`,color:b.accent,border:`1px solid ${b.accent}30`}}>{b.badge}</span>
                    </div>
                    <p style={{fontSize:'13px',lineHeight:1.6,color:'#94a3b8',margin:0}}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    <p style={{color:'#1e2d45',fontSize:'12px',marginTop:'32px',textAlign:'center'}}>SaludCompartida · contacto@saludcompartida.com · saludcompartida.app</p>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// CONTROLADOR PRINCIPAL — máquina de estados pura
// Sin redirect. Sin localStorage. Sin router. Todo en React state.
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [status,setStatus]     = useState('landing');
  const [userData,setUserData] = useState(null as any);

  function handleSuccess(data:any){setUserData(data);setStatus('welcome');}
  function handleLogout(){setUserData(null);setStatus('landing');}

  return <>
    <style>{GLOBAL_CSS}</style>
    {status==='landing' && <Landing onSuccess={handleSuccess}/>}
    {status==='welcome' && <WelcomeScreen userData={userData} onEnter={()=>setStatus('ready')}/>}
    {status==='ready'   && <Dashboard userData={userData} onLogout={handleLogout}/>}
  </>;
}

"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
type Creative={angle:string;hook:string;script:string;cta:string;shots:string[]};type Product={title:string;price:string;image?:string};
export default function Results(){
 const [creatives,setCreatives]=useState<Creative[]>([]);const [product,setProduct]=useState<Product|null>(null);const [active,setActive]=useState(0);const canvas=useRef<HTMLCanvasElement>(null);const [recording,setRecording]=useState(false);
 useEffect(()=>{try{setCreatives(JSON.parse(sessionStorage.getItem("e3laniCreatives")||"[]"));setProduct(JSON.parse(sessionStorage.getItem("e3laniProduct")||"null"))}catch{}},[]);
 const c=creatives[active];
 function draw(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,img?:HTMLImageElement){
  ctx.fillStyle="#063b2f";ctx.fillRect(0,0,w,h);const phase=Math.min(3,Math.floor(t/3.75));const zoom=1+0.06*Math.sin(t*.7);
  if(img){const iw=w*.72*zoom,ih=iw*(img.height/img.width);ctx.globalAlpha=.92;ctx.drawImage(img,(w-iw)/2,180+(phase%2)*35,iw,Math.min(ih,720));ctx.globalAlpha=1}
  ctx.fillStyle="#d7ad55";ctx.font="700 30px Arial";ctx.textAlign="center";ctx.fillText("إعلاني AI",w/2,70);
  ctx.fillStyle="rgba(0,0,0,.48)";ctx.fillRect(35,880,w-70,310);ctx.fillStyle="#fff";ctx.direction="rtl";ctx.font="700 44px Arial";
  const text=phase===0?c.hook:phase===3?c.cta:(c.shots[phase]||c.script);wrap(ctx,text,w/2,950,w-110,58);
  if(product?.price){ctx.fillStyle="#d7ad55";ctx.font="700 38px Arial";ctx.fillText(product.price,w/2,1140)}
 }
 function wrap(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,max:number,lh:number){const words=text.split(" ");let line="";for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>max&&line){ctx.fillText(line,x,y);line=word+" ";y+=lh}else line=test}ctx.fillText(line,x,y)}
 async function makeVideo(){if(!c||!canvas.current)return;setRecording(true);const cv=canvas.current,ctx=cv.getContext("2d")!;let img:HTMLImageElement|undefined;if(product?.image){img=new Image();img.crossOrigin="anonymous";img.src=product.image;try{await img.decode()}catch{img=undefined}}
 const stream=cv.captureStream(30);const chunks:Blob[]=[];const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";const rec=new MediaRecorder(stream,{mimeType:mime});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:mime});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="e3lani-ad.webm";a.click();setRecording(false)};rec.start();const start=performance.now();function frame(now:number){const t=(now-start)/1000;draw(ctx,cv.width,cv.height,t,img);if(t<15)requestAnimationFrame(frame);else rec.stop()}requestAnimationFrame(frame)}
 return <div className="dash"><aside className="side"><div className="brand">إعلاني AI</div><Link href="/dashboard">⌂ الرئيسية</Link><Link href="/campaign/new">✦ حملة جديدة</Link></aside><main className="main"><h1>Video Builder</h1><p>نسخة V1 بدون Video API — إعلان عمودي 9:16 من المنتج + captions + الحركة.</p>
 {!c?<div className="card"><h2>ما كايناش حملة جاهزة</h2><Link className="primary btn" href="/campaign/new">أنشئ حملة أولاً</Link></div>:<div className="videoBuilder"><div><canvas ref={canvas} width="540" height="960" className="videoCanvas"/><button className="primary btn full" onClick={makeVideo} disabled={recording}>{recording?"جاري إنشاء فيديو 15 ثانية...":"▶ إنشاء وتحميل الفيديو"}</button><p className="muted">V1 يصدر WebM من المتصفح. MP4 + الصوت نضيفهما في المرحلة التالية.</p></div><div><h2>{product?.title}</h2><div className="choiceRow">{creatives.map((x,i)=><button className={"choice "+(active===i?"selected":"")} onClick={()=>setActive(i)} key={i}>#{i+1} {x.angle}</button>)}</div><div className="card"><h3>⚡ {c.hook}</h3><p>{c.script}</p><strong>{c.cta}</strong><ol>{c.shots.map((s,i)=><li key={i}>{s}</li>)}</ol></div></div></div>}</main></div>
}
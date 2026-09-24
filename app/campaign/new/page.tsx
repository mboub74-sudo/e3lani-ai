"use client";
import Link from "next/link";
import {useState} from "react";

type Product={title:string;price:string;description:string;image?:string;source:string};
const angles=["💰 السعر والعرض","✨ فاخر وفخامة","🎁 هدية ومناسبات","🔥 مشكلة ← حل","👤 تجربة مستخدم UGC","❓ فضول وتشويق"];

export default function Campaign(){
 const [url,setUrl]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 const [product,setProduct]=useState<Product|null>(null); const [selected,setSelected]=useState<number[]>([0,1,4]);
 async function analyze(){
  setError(""); if(!url.trim()){setError("ألصق رابط المنتج أولاً.");return}
  setLoading(true);
  try{const r=await fetch("/api/analyze-product",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
   const d=await r.json(); if(!r.ok) throw new Error(d.error||"تعذر تحليل المنتج"); setProduct(d.product);
  }catch(e:any){setError(e.message||"حدث خطأ");}finally{setLoading(false)}
 }
 function toggle(i:number){setSelected(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])}
 return <div className="dash"><aside className="side"><div className="brand">إعلاني AI</div><br/><Link href="/dashboard">⌂ الرئيسية</Link><Link className="active" href="/campaign/new">✦ إنشاء حملة</Link></aside>
 <main className="main"><div className="wizard"><h1>إنشاء حملة جديدة</h1><p>1. المنتج ← 2. الزوايا ← 3. الإعدادات ← 4. الفيديوهات</p>
 <div className="card analyzer"><h2>🔗 ألصق رابط المنتج</h2><p>يدعم حالياً صفحات المنتجات العامة. ربط سلة وزد بالحساب سيأتي في المرحلة التالية.</p>
 <div className="urlbox campaignUrl"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://store.com/product/..."/><button className="primary btn" onClick={analyze} disabled={loading}>{loading?"جاري التحليل...":"تحليل المنتج بالذكاء الاصطناعي"}</button></div>{error&&<p className="error">{error}</p>}</div>
 {product&&<><div className="card productPreview">{product.image?<img src={product.image} alt={product.title}/>:<div className="productimg">📦</div>}<div><span className="pill">{product.source}</span><h2>{product.title}</h2><div className="price small">{product.price||"السعر غير ظاهر"}</div><p>{product.description||"تم استخراج بيانات المنتج بنجاح."}</p></div></div>
 <h2>اختر الزوايا الإعلانية</h2><p>اختر الزوايا التي تريد اختبارها لهذا المنتج.</p><div className="angles">{angles.map((x,i)=><button onClick={()=>toggle(i)} className={"angle "+(selected.includes(i)?"selected":"")} key={x}><h3>{x}</h3><p>{i===4?"أسلوب طبيعي مناسب لإعلانات المحتوى القصير":"Hook سعودي مختلف مبني على المنتج"}</p></button>)}</div><br/>
 <Link className={"primary btn "+(!selected.length?"disabled":"")} href={selected.length?"/results":"#"}>إنشاء {selected.length} أفكار إعلانية ←</Link></>}</div></main></div>
}
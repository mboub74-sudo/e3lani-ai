import {NextRequest,NextResponse} from "next/server";
function pick(html:string,patterns:RegExp[]){for(const p of patterns){const m=html.match(p);if(m?.[1])return m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').trim()}return ""}
export async function POST(req:NextRequest){
 try{
  const {url}=await req.json(); if(!url) return NextResponse.json({error:"الرابط مطلوب"},{status:400});
  let u:URL; try{u=new URL(url)}catch{return NextResponse.json({error:"الرابط غير صحيح"},{status:400})}
  if(!["http:","https:"].includes(u.protocol)) return NextResponse.json({error:"نوع الرابط غير مدعوم"},{status:400});
  const r=await fetch(u.toString(),{headers:{"User-Agent":"Mozilla/5.0 E3laniAI/1.0"},redirect:"follow",signal:AbortSignal.timeout(10000)});
  if(!r.ok) return NextResponse.json({error:"لم نتمكن من فتح صفحة المنتج"},{status:422});
  const html=(await r.text()).slice(0,1500000);
  const title=pick(html,[/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,/<title[^>]*>([^<]+)<\/title>/i]);
  const description=pick(html,[/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i]);
  const image=pick(html,[/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i]);
  const price=pick(html,[/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,/"price"\s*:\s*"([^"]+)"/i]);
  if(!title) return NextResponse.json({error:"فتحنا الصفحة، لكن لم نجد بيانات منتج واضحة. جرّب رابط صفحة منتج مباشر."},{status:422});
  return NextResponse.json({product:{title,description,image,price:price?price+" ر.س":"",source:u.hostname.replace(/^www\./,"")}});
 }catch(e){return NextResponse.json({error:"تعذر تحليل الرابط حالياً. بعض المتاجر تمنع القراءة الآلية."},{status:500})}
}
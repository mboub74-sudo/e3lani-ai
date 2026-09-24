import {NextRequest,NextResponse} from "next/server";
export async function POST(req:NextRequest){
 try{
  const {product,angles}=await req.json();if(!product||!Array.isArray(angles)||!angles.length)return NextResponse.json({error:"بيانات المنتج والزوايا مطلوبة"},{status:400});
  const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:"Saudi Creative Brain جاهز، لكن خاصنا نضيف OPENAI_API_KEY في Vercel Environment Variables."},{status:503});
  const prompt=`أنت مدير إبداعي متخصص حصراً في إعلانات التجارة الإلكترونية في السعودية. اكتب عربية سعودية طبيعية ومحترمة، بدون ادعاءات كاذبة أو شهادات مختلقة. المنتج: ${JSON.stringify(product)}. الزوايا المطلوبة: ${JSON.stringify(angles)}. لكل زاوية أنشئ إعلان فيديو 15 ثانية. أرجع JSON فقط بالشكل: {"creatives":[{"angle":"...","hook":"...","script":"...","cta":"...","shots":["...","...","...","..."]}]}. اجعل الـhook قصيراً جداً، النص قابلاً للنطق خلال 15 ثانية، والـshots قابلة للتنفيذ بصور المنتج ولقطات AI قصيرة.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:prompt,reasoning:{effort:"none"},text:{format:{type:"json_object"}}})});
  const d=await r.json();if(!r.ok)return NextResponse.json({error:d?.error?.message||"فشل اتصال AI"},{status:502});
  const txt=d.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==="output_text")?.text;if(!txt)throw new Error("empty");
  return NextResponse.json(JSON.parse(txt));
 }catch{return NextResponse.json({error:"تعذر إنشاء الحملة حالياً"},{status:500})}
}
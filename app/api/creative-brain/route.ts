import {NextRequest,NextResponse} from "next/server";
type Product={title?:string;price?:string;description?:string;source?:string};
type Creative={angle:string;hook:string;script:string;cta:string;shots:string[]};
const pick=<T,>(a:T[],seed:number)=>a[Math.abs(seed)%a.length];
const hash=(s:string)=>[...s].reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0);
const hooks:Record<string,string[]>={
 "السعر والعرض":["السعر هذا على {p}؟ 👀","إذا كنت تنتظر عرض على {p}، شوف هذا.","وفرها عليك: {p} متوفر الآن {price}."],
 "فاخر وفخامة":["تفاصيل صغيرة… لكن الفرق يبان.","للي يحب الاختيارات اللي لها حضور.","{p} بتفاصيل تخلي التجربة أرقى."],
 "هدية ومناسبات":["محتار بالهدية؟ يمكن لقيتها.","هدية مرتبة بدون حيرة طويلة.","للمناسبة الجاية، خل اختيارك أبسط."],
 "مشكلة ← حل":["تعبت تدور على الخيار المناسب؟","إذا هالمشكلة تتكرر معك، شوف هذا.","حل أبسط يبدأ من اختيار صح."],
 "تجربة مستخدم UGC":["قلت أجربه… والنتيجة فاجأتني.","أول شيء لاحظته لما جربت {p}…","هذا من الأشياء اللي تستاهل تشوفها بنفسك."],
 "فضول وتشويق":["وش اللي مخلي الناس توقف عند {p}؟","قبل ما تكمل تسوق… شوف هالتفصيل.","ثواني وبقول لك ليه {p} يستحق نظرة."]
};
const ctas=["اطلبه الآن من المتجر.","شوف التفاصيل واطلبه اليوم.","اكتشف المنتج الآن.","جرّبه وخذ قرارك بنفسك."];
function clean(s:string){return (s||"").replace(/\s+/g," ").trim()}
function fill(s:string,p:Product){return s.replaceAll("{p}",clean(p.title||"هذا المنتج")).replaceAll("{price}",clean(p.price||"بسعره الحالي"))}
function make(angle:string,p:Product,i:number):Creative{
 const seed=hash((p.title||"product")+angle+i);const title=clean(p.title||"المنتج");const price=clean(p.price||"");
 const hook=fill(pick(hooks[angle]||hooks["فضول وتشويق"],seed),p);
 const desc=clean(p.description||"").slice(0,125);
 const middle:Record<string,string>={
  "السعر والعرض":`${title} ${price?`متوفر بـ ${price}. `:""}شوف التفاصيل وقارنها باحتياجك قبل الطلب.`,
  "فاخر وفخامة":`${title} يقدم تجربة مرتبة واهتمام بالتفاصيل. ${desc}`,
  "هدية ومناسبات":`${title} خيار يستحق النظر إذا كنت تدور على هدية عملية ومرتبة. ${desc}`,
  "مشكلة ← حل":`بدل كثرة الخيارات، ركّز على اللي يناسب احتياجك. ${title}: ${desc}`,
  "تجربة مستخدم UGC":`خلني أوريك ${title} بسرعة. ${desc} ${price?`وسعره ${price}.`:""}`,
  "فضول وتشويق":`السر في التفاصيل: ${title}. ${desc}`
 };
 const seasonal=["رمضان","العيد","اليوم الوطني","يوم التأسيس","نهاية الشهر"];
 const shots=[`0–3ث: لقطة قوية للمنتج + النص: «${hook}»`,`3–7ث: Close-up لأهم تفاصيل ${title}`,`7–11ث: استخدام/مشهد Lifestyle مناسب للمنتج`,`11–15ث: ${price?price+" + ":""}CTA واضح وشعار المتجر`];
 return {angle,hook,script:middle[angle]||middle["فضول وتشويق"],cta:pick(ctas,seed+7),shots};
}
export async function POST(req:NextRequest){
 try{const {product,angles,tone="UGC",season="تلقائي"}=await req.json() as {product:Product;angles:string[];tone?:string;season?:string};if(!product||!Array.isArray(angles)||!angles.length)return NextResponse.json({error:"بيانات المنتج والزوايا مطلوبة"},{status:400});
 const now=new Date();const m=now.getUTCMonth()+1,d=now.getUTCDate();let resolved=season;
 if(season==="تلقائي"){if(m===9&&d>=10&&d<=30)resolved="اليوم الوطني";else if((m===2&&d>=15)||m===3)resolved="رمضان";else if(d>=25)resolved="Payday";else resolved="عادي";}
 const seasonLine:Record<string,string>={"رمضان":"رمضان فرصة تخلي عرضك أقرب لعملائك.","العيد":"خل فرحة العيد تبدأ باختيار مرتب.","اليوم الوطني":"احتفل باليوم الوطني بعرض يستاهل 🇸🇦","يوم التأسيس":"في يوم التأسيس، تفاصيلنا تحكي ذوقنا 🇸🇦","Payday":"نزل الراتب؟ هذا وقت العرض اللي كنت تنتظره.","عادي":""};
 const tonePrefix:Record<string,string>={"UGC":"بأسلوب تجربة طبيعية: ","Premium":"بأسلوب راقٍ وهادئ: ","Direct Response":"بأسلوب مباشر للبيع: ","Emotional":"بأسلوب عاطفي: "};
 const creatives=angles.flatMap((ang,i)=>[make(ang,product,i),make(ang,product,i+101)]).map(c=>({...c,hook:(seasonLine[resolved]?seasonLine[resolved]+" ":"")+c.hook,script:(tonePrefix[tone]||"")+c.script}));
 return NextResponse.json({engine:"Saudi Creative Brain V2 — No API",tone,season:resolved,creatives});
 }catch{return NextResponse.json({error:"تعذر إنشاء الحملة حالياً"},{status:500})}
}
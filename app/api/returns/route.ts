import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const reasons=['size_fit','damaged','wrong_item','quality','changed_mind','other'] as const;
type Reason=typeof reasons[number];

export async function GET(request:Request){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Authentication required.'},{status:401});
  const orderId=new URL(request.url).searchParams.get('orderId')||'';
  if(!orderId) return NextResponse.json({error:'Order id is required.'},{status:400});
  const {data,error}=await supabase.from('return_requests').select('id,order_id,reason,details,status,created_at,updated_at').eq('order_id',orderId).eq('user_id',user.id).maybeSingle();
  if(error) return NextResponse.json({error:'Unable to load return request.'},{status:500});
  return NextResponse.json({request:data});
}

export async function POST(request:Request){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Authentication required.'},{status:401});
  let body:{orderId?:string;reason?:string;details?:string};
  try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
  const orderId=String(body.orderId||'');
  const reason=String(body.reason||'') as Reason;
  const details=String(body.details||'').trim().slice(0,1000);
  if(!orderId||!reasons.includes(reason)) return NextResponse.json({error:'Please choose a return reason.'},{status:400});
  const {data,error}=await supabase.from('return_requests').insert({order_id:orderId,user_id:user.id,reason,details:details||null}).select('id,order_id,reason,details,status,created_at,updated_at').single();
  if(error){
    if(error.code==='23505') return NextResponse.json({error:'A return request already exists for this order.'},{status:409});
    return NextResponse.json({error:error.message||'Unable to submit return request.'},{status:400});
  }
  return NextResponse.json({request:data},{status:201});
}

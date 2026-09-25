import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const statuses=new Set(['draft','pending_payment','paid','processing','shipped','delivered','cancelled','refunded']);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Authentication required.'},{status:401});

  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role!=='admin') return NextResponse.json({error:'Admin access required.'},{status:403});

  let body:{status?:string};
  try{body=await request.json();}catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
  const status=String(body.status||'');
  if(!statuses.has(status)) return NextResponse.json({error:'Invalid order status.'},{status:400});

  const {data:order,error}=await supabase.from('orders').update({status}).eq('id',id).select('id,status').maybeSingle();
  if(error||!order) return NextResponse.json({error:'Order not found or could not be updated.'},{status:404});
  return NextResponse.json(order);
}

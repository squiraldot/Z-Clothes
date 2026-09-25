import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(_request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Authentication required.'},{status:401});
  const {data,error}=await supabase.rpc('cancel_my_order',{p_order_id:id});
  if(error) return NextResponse.json({error:error.message||'This order cannot be cancelled.'},{status:400});
  return NextResponse.json({order:data});
}

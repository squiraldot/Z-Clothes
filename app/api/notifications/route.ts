import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Authentication required.'},{status:401});
 const {data,error}=await supabase.from('notifications').select('id,type,title,body,order_id,read_at,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30);
 if(error)return NextResponse.json({error:'Unable to load notifications.'},{status:500});
 return NextResponse.json({notifications:data||[]});
}

export async function PATCH(request:Request){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Authentication required.'},{status:401});
 let body:{id?:string;all?:boolean};
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const now=new Date().toISOString();
 const q=supabase.from('notifications').update({read_at:now}).eq('user_id',user.id);
 const {error}=body.all?q:q.eq('id',String(body.id||''));
 if(error)return NextResponse.json({error:'Unable to update notification.'},{status:400});
 return NextResponse.json({ok:true});
}

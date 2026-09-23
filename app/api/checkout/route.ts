import { NextResponse } from 'next/server';
import { dodoClient } from '@/lib/dodo';

export async function POST(req:Request){
  try{
    const body=await req.json();
    const items=Array.isArray(body.items)?body.items:[];
    if(!items.length) return NextResponse.json({error:'At least one checkout item is required.'},{status:400});
    const product_cart=items.map((x:any)=>({product_id:String(x.productId),quantity:Math.max(1,Number(x.quantity||1))}));
    const client=dodoClient();
    if(!client)return NextResponse.json({error:'Dodo Payments is not configured.'},{status:503});
    const session=await client.checkoutSessions.create({product_cart,return_url:process.env.DODO_PAYMENTS_RETURN_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`});
    return NextResponse.json({checkout_url:session.checkout_url,session_id:session.session_id});
  }catch(e){console.error(e);return NextResponse.json({error:'Unable to create checkout session.'},{status:500})}
}

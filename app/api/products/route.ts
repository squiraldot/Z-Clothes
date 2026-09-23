import { NextResponse } from 'next/server'; import { getProducts } from '@/lib/blogger';
export async function GET(){try{return NextResponse.json(await getProducts())}catch(e){return NextResponse.json({error:'Unable to load products'},{status:502})}}

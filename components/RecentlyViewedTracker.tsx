'use client';
import { useEffect } from 'react';
import { rememberRecentlyViewed } from './RecentlyViewed';
export function RecentlyViewedTracker({productId}:{productId:string}){useEffect(()=>{rememberRecentlyViewed(productId)},[productId]);return null;}

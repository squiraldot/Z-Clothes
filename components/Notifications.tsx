'use client';

import Link from 'next/link';
import { Bell } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

export default function Notifications(){
  const [unread,setUnread]=useState(0);

  async function load(){
    try{
      const r=await fetch('/api/notifications',{cache:'no-store'});
      const d=await r.json();
      if(r.ok) setUnread((d.notifications||[]).filter((n:{read_at:string|null})=>!n.read_at).length);
    }catch{}
  }

  useEffect(()=>{
    load();
    const onFocus=()=>load();
    window.addEventListener('focus',onFocus);
    const timer=window.setInterval(load,30000);
    return()=>{window.removeEventListener('focus',onFocus);window.clearInterval(timer)};
  },[]);

  return <Link className="notification-trigger" href="/account/notifications" aria-label={unread ? String(unread)+' unread notifications' : 'Notifications'}>
    <Bell size={18}/>
    {unread>0&&<span className="notification-count">{unread>9?'9+':unread}</span>}
  </Link>;
}

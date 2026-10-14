import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-state';
import { QuestDialog } from './quest-dialog';
import { Button } from '@/components/ui/button';
import { Mascot } from './mascot';
const BookmarkContext=createContext<{saved:string[];toggle:(id:string)=>void;pending:string[];loading:boolean;error:Error|null}>({saved:[],toggle:()=>{},pending:[],loading:false,error:null});
export function BookmarksProvider({children}:{children:ReactNode}) {
 const {user,loading:authLoading}=useAuth();const queryClient=useQueryClient();const location=useLocation();const [signIn,setSignIn]=useState(false);const [pending,setPending]=useState<string[]>([]);const locks=useRef(new Set<string>());
 const key=['bookmarks',user?.id];
 const query=useQuery({queryKey:key,enabled:Boolean(user),queryFn:async({signal})=>{const {data,error}=await supabase.from('bookmarks').select('hackathon_id').abortSignal(signal);if(error)throw error;return (data??[]).map(row=>row.hackathon_id);}});
 const saved=user?query.data??[]:[];
 async function toggle(id:string){if(!user){setSignIn(true);return;}if(locks.current.has(id))return;locks.current.add(id);setPending(prev=>[...prev,id]);try{
 const removing=saved.includes(id);const request=removing?supabase.from('bookmarks').delete().eq('user_id',user.id).eq('hackathon_id',id):supabase.from('bookmarks').insert({user_id:user.id,hackathon_id:id});
 const {error}=await request;if(error)throw error;
 queryClient.setQueryData<string[]>(key,prev=>removing?(prev??[]).filter(x=>x!==id):[...new Set([...(prev??[]),id])]);
 toast.success(removing?'Removed from Quest Log':'Saved to Quest Log');
 }catch{toast.error('Could not update your Quest Log. Please try again.');}finally{locks.current.delete(id);setPending(prev=>prev.filter(x=>x!==id));}}
 return <BookmarkContext.Provider value={{saved,toggle:id=>{void toggle(id);},pending,loading:authLoading||Boolean(user)&&query.isPending,error:query.error}}>{children}<QuestDialog open={signIn} onClose={()=>setSignIn(false)} title="Save your next quest" kind="auth"><div className="sq-discovery-empty"><Mascot/><h2>Keep this quest close.</h2><p>Log in to save hackathons to your Quest Log.</p><Button asChild><Link to="/login" search={{next:location.pathname==='/quest-log'?'/quest-log':'/discover'}} onClick={()=>setSignIn(false)}>Log in or sign up</Link></Button><Button variant="ghost" onClick={()=>setSignIn(false)}>Keep browsing</Button></div></QuestDialog></BookmarkContext.Provider>;
}
export function useBookmarks() { return useContext(BookmarkContext); }
export function useCountdownClock(initial:number) {
 const [now,setNow]=useState(initial);
 useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return ()=>clearInterval(timer);},[initial]);
 return now;
}
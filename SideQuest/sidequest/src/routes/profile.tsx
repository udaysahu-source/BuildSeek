import { createFileRoute, Link } from '@tanstack/react-router';
import { pageHead } from '@/components/sidequest/placeholder';
import { useAuth } from '@/components/sidequest/auth-state';
import { useBookmarks } from '@/components/sidequest/discovery-state';
import { Button } from '@/components/ui/button';
import { UserRound, LogOut, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
export const Route = createFileRoute('/profile')({
 component: Page,
 head: () => pageHead('Your account', 'Manage your SideQuest sign-in and visit your saved hackathons.'),
});
function Page(){const {user,loading}=useAuth();const {saved}=useBookmarks();const queryClient=useQueryClient();const navigate=Route.useNavigate();const [busy,setBusy]=useState(false);const [error,setError]=useState('');async function signOut(){setBusy(true);setError('');try{await queryClient.cancelQueries();queryClient.clear();const {error}=await supabase.auth.signOut();if(error)throw error;await navigate({to:'/auth',replace:true});}catch{setError('Could not sign out. Please try again.');}finally{setBusy(false);}}
 return <main className="sq-account-page sq-container"><div className="sq-recovery"><span className="sq-account-avatar"><UserRound size={38}/></span><h1>Your account.</h1>{loading?<p role="status">Loading account…</p>:user?<><p className="sq-account-email">{user.email}</p><p><Bookmark size={16} className="inline"/> {saved.length} saved quests</p><div className="sq-placeholder-actions"><Button asChild><Link to="/quest-log">Open Quest Log</Link></Button><Button variant="outline" disabled={busy} onClick={signOut}><LogOut size={17}/>{busy?'Signing out…':'Sign out'}</Button></div>{error&&<p role="alert" className="sq-auth-error">{error}</p>}</>:<><p>Log in to keep your next big opportunities close.</p><Button asChild><Link to="/login" search={{next:'/profile'}}>Log in or sign up</Link></Button></>}</div></main>;
}

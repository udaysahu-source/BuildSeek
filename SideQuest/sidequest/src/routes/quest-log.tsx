import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { pageHead } from '@/components/sidequest/placeholder';
import { useAuth } from '@/components/sidequest/auth-state';
import { useBookmarks, useCountdownClock } from '@/components/sidequest/discovery-state';
import { HackathonCard } from '@/components/sidequest/hackathon-card';
import { Mascot } from '@/components/sidequest/mascot';
import { Button } from '@/components/ui/button';
import { hackathonsQuery } from '@/lib/hackathons.queries';
import { questGroups, questTab, type QuestTab } from '@/lib/quests';
export const Route = createFileRoute('/quest-log')({
 component: Page,
 validateSearch:search=>z.object({tab:z.enum(['active','upcoming','past']).optional().catch(undefined)}).parse(search),
 loader:({context})=>context.queryClient.ensureQueryData(hackathonsQuery),
 head: () => pageHead('Your Quest Log', 'All the hackathons you want to take on, together in one place.'),
});
function Page(){const {user,loading:authLoading}=useAuth();const {saved,loading,error}=useBookmarks();const {data}=useSuspenseQuery(hackathonsQuery);const now=useCountdownClock(data.now);const {tab='active'}=Route.useSearch();const navigate=Route.useNavigate();const groups=questGroups(data.events,saved,tab,now);const total=groups.reduce((sum,g)=>sum+g.events.length,0);
 return <main className="sq-account-page sq-container"><header className="sq-quest-heading"><div><span className="sq-eyebrow"><Bookmark size={15}/> Your next big things</span><h1>Your Quest Log<span>.</span></h1><p>A little ambition, all in one place.</p></div><Mascot/></header>{authLoading?<p role="status">Opening your Quest Log…</p>:!user?<div className="sq-discovery-empty"><Mascot/><h2>Your quests need a home.</h2><p>Log in to keep your saved hackathons together.</p><Button asChild><Link to="/login" search={{next:'/quest-log'}}>Log in or sign up <ArrowUpRight size={17}/></Link></Button><Link to="/discover" className="sq-browse-link">Browse hackathons</Link></div>:<><div className="sq-quest-tabs" role="group" aria-label="Quest timeline">{(['active','upcoming','past'] as QuestTab[]).map(value=><Button key={value} variant={tab===value?'default':'ghost'} aria-pressed={tab===value} onClick={()=>{void navigate({search:{tab:value},replace:true,resetScroll:false});}}>{value}<span>{data.events.filter(e=>saved.includes(e.id)&&questTab(e,now)===value).length}</span></Button>)}</div>{error?<p role="alert" className="sq-auth-error">Your saved quests couldn’t load. Please refresh and try again.</p>:loading?<p role="status">Gathering your saved quests…</p>:total?groups.filter(g=>g.events.length).map(group=><section key={group.title} className="sq-quest-group"><h2>{group.title}<span>{group.events.length}</span></h2><div className="sq-event-grid">{group.events.map(event=><HackathonCard key={event.id} event={event} now={now} onOpen={id=>{void navigate({to:'/h/$id',params:{id}});}}/>)}</div></section>):<div className="sq-discovery-empty"><Mascot/><h2>{saved.length?'No quests on this timeline.':'Your next quest is out there.'}</h2><p>{saved.length?'Check another tab for your saved hackathons.':'Find a hackathon that sparks an idea, and save it here.'}</p><Button asChild><Link to="/discover">Discover hackathons <ArrowUpRight size={17}/></Link></Button></div>}</>}</main>;
}

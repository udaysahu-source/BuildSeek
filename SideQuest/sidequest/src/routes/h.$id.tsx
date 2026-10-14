import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { pageHead } from '@/components/sidequest/placeholder';
import { HackathonDetail } from '@/components/sidequest/hackathon-detail';
import { DiscoverySkeleton } from '@/components/sidequest/discovery-skeleton';
import { useCountdownClock } from '@/components/sidequest/discovery-state';
import { Mascot } from '@/components/sidequest/mascot';
import { Button } from '@/components/ui/button';
import { hackathonQuery } from '@/lib/hackathons.queries';
export const Route=createFileRoute('/h/$id')({
 loader:async({context,params})=>{const data=await context.queryClient.ensureQueryData(hackathonQuery(params.id));return {title:data.event?.title};},
 pendingComponent:DiscoverySkeleton,
 component:Page,
 head:({loaderData})=>pageHead(loaderData?.title??'Quest not found',loaderData?.title?`Explore ${loaderData.title}, a fictional SideQuest sample hackathon. See deadlines, prize pool, team size, and eligibility.`:'This SideQuest sample hackathon could not be found.'),
});
function Page() {const {id}=Route.useParams();const {data}=useSuspenseQuery(hackathonQuery(id));const now=useCountdownClock(data.now);return <main className="sq-detail-page">{data.event?<HackathonDetail event={data.event} now={now}/>:<div className="sq-discovery-empty"><Mascot/><h1>Quest not found.</h1><p>This sample event isn’t on the board.</p><Button asChild><Link to="/discover">Back to Discover</Link></Button></div>}</main>;}

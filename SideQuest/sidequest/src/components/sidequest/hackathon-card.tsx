import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Bookmark, Clock3, Globe2, MapPin, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countdown, formatPrize, getStatus, statusLabel, type Hackathon } from '@/lib/hackathons';
import { useBookmarks } from './discovery-state';

export function CountdownChip({event,now}:{event:Hackathon;now:number}) {
 const time=countdown(event,now);
 const today=statusLabel(event,now)==='Closes today';
 return <div className={`sq-countdown-chip ${today?'today':time.status}`}><Clock3 size={13}/><span>{statusLabel(event,now)}</span>{time.status!=='closed'&&<strong>{time.days}d {String(time.hours).padStart(2,'0')}h {String(time.minutes).padStart(2,'0')}m {String(time.seconds).padStart(2,'0')}s</strong>}</div>;
}
export function BookmarkButton({event}:{event:Hackathon}) {
 const {saved,toggle,pending,loading}=useBookmarks();const active=saved.includes(event.id);
 return <Button variant="ghost" size="icon" disabled={loading||pending.includes(event.id)} aria-label={`${active?'Unsave':'Save'} ${event.title}`} aria-pressed={active} title={active?'Remove from Quest Log':'Save to Quest Log'} className={`sq-bookmark ${active?'saved':''}`} onClick={()=>toggle(event.id)}><Bookmark fill={active?'currentColor':'none'} /></Button>;
}
export function HackathonCard({event,now,onOpen}:{event:Hackathon;now:number;onOpen:(id:string)=>void}) {
 return <article className={`sq-event-card status-${getStatus(event,now)}`}>
  <div className="sq-card-top"><span className="sq-card-event-icon"><Zap size={23} fill="currentColor" /></span>{event.is_sample!==false&&<span className="sq-card-sample">Sample event</span>}<BookmarkButton event={event}/></div>
  <CountdownChip event={event} now={now}/>
  <div className="sq-card-location"><span><Globe2 size={12}/>{event.mode}</span><span><MapPin size={12}/>{event.city}</span></div>
  <h2><Link to="/h/$id" params={{id:event.id}} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&window.matchMedia('(min-width: 1024px)').matches){e.preventDefault();onOpen(event.id);}}}>{event.title}</Link></h2><p className="sq-card-organizer">{event.organizer}</p>
  <div className="sq-card-facts"><div><Trophy size={17}/><span><small>Prize pool</small><strong>{formatPrize(event.prize_amount_inr)}</strong></span></div><div><Users size={17}/><span><small>Team size</small><strong>{event.team_min}–{event.team_max} members</strong></span></div></div>
  <div className="sq-card-tags">{event.tags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div>
  <div className="sq-card-footer"><span>{event.source}</span><Button asChild size="icon"><Link to="/h/$id" params={{id:event.id}} aria-label={`View ${event.title}`} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&window.matchMedia('(min-width: 1024px)').matches){e.preventDefault();onOpen(event.id);}}}><ArrowUpRight/></Link></Button></div>
 </article>;
}
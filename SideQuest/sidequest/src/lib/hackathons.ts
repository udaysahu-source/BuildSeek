export type Mode = 'online' | 'offline' | 'hybrid';
export type Status = 'upcoming' | 'open' | 'closing-soon' | 'closed';
export interface Hackathon {
 id: string; title: string; organizer: string; source: string; source_url: string;
 mode: Mode; city: string; tags: string[]; prize_amount_inr: number; team_min: number; team_max: number;
 reg_start: string; reg_deadline: string; start_date: string; end_date: string;
 eligibility: string; description: string; is_sample?: boolean;
}
export interface DiscoveryFilters { q?: string | undefined; mode?: Mode | undefined; status?: Status | undefined; city?: string | undefined; prize?: number | undefined; tags?: string[] | undefined; students?: boolean | undefined; sort?: 'closing' | 'match' | 'prize' | undefined; page?: number | undefined; event?: string | undefined; }
export const HOUR = 3_600_000;
export const THEMES = ['AI / ML', 'Web development', 'Sustainability', 'Fintech', 'Healthtech', 'Open innovation', 'Blockchain'];
export const CITIES = ['Pan India', 'Bengaluru', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur'];
const anchor = Date.parse('2026-10-14T11:00:00Z');
function date(hours: number) { return new Date(anchor + hours * HOUR).toISOString(); }
const seeds: Array<[string, string, Mode, string, number, string[], number, boolean]> = [
 ['Buildverse 2026','Nexus Institute of Technology','online','Pan India',200000,['AI / ML','Web development'],54,true],
 ['Hack the Horizon','Horizon Student Collective','hybrid','Bengaluru',150000,['Open innovation','Sustainability'],120,true],
 ['GreenSprint','Verdant Engineering College','offline','Delhi',100000,['Sustainability','Web development'],10,true],
 ['Code Circuit','Circuit Campus Club','online','Pan India',75000,['Web development','Open innovation'],240,false],
 ['Neural Nights','Synapse Student Society','offline','Hyderabad',300000,['AI / ML','Healthtech'],68,true],
 ['FinForge','Ledger Institute','hybrid','Mumbai',250000,['Fintech','Blockchain'],168,false],
 ['Pixel Pioneers','Pixel Campus Collective','online','Pan India',50000,['Web development'],36,true],
 ['CareCode Challenge','WellSpring Technical College','offline','Chennai',125000,['Healthtech','AI / ML'],288,true],
 ['Campus Catalyst','Catalyst Student Guild','hybrid','Pune',80000,['Open innovation'],400,true],
 ['Block & Build','Chainwave Innovation Club','online','Pan India',180000,['Blockchain','Fintech'],520,false],
 ['RiverHack','Riverstone Institute','offline','Kolkata',60000,['Sustainability'],-24,true],
 ['Desert Debug','Dune Technical Society','offline','Jaipur',90000,['Web development','AI / ML'],216,true],
 ['Launchpad Labs','Orbit Campus Collective','online','Pan India',400000,['Open innovation','Web development'],600,false],
 ['Sparkathon','Spark Engineering Academy','hybrid','Delhi',120000,['AI / ML','Sustainability'],60,true],
 ['MindMesh','Cognition College Club','offline','Bengaluru',220000,['AI / ML'],800,true],
 ['ByteBloom','Bloom Student Network','online','Pan India',35000,['Web development','Healthtech'],-80,true],
 ['Urban Uplink','Metro Innovation Society','hybrid','Mumbai',160000,['Sustainability','Open innovation'],360,false],
 ['Quantum Campus','Quanta Institute of Engineering','offline','Pune',500000,['AI / ML','Open innovation'],1000,true],
 ['OpenOrbit','Orbit Student Developers','online','Pan India',0,['Open innovation','Web development'],480,false],
 ['MedSprint','Pulse Technical Collective','hybrid','Hyderabad',140000,['Healthtech','AI / ML'],900,true],
];
export const MOCK_HACKATHONS: Hackathon[] = seeds.map(([title,organizer,mode,city,prize,tags,deadline,students],i) => ({
 id: `sq-${i+1}`, title, organizer, mode, city, tags, prize_amount_inr:prize,
 source: ['via Unstop','via Devfolio','via college website','via community board'][i%4] ?? 'via community board',
 source_url:'https://example.com', team_min:i%3===0?1:2, team_max:i%4===0?5:4,
 reg_start:date(deadline>700?deadline-300:-360), reg_deadline:date(deadline), start_date:date(deadline+72),end_date:date(deadline+120),
 eligibility:students?'College students only':'Open to everyone',
 description:`Bring your ideas to life at ${title}, a fictional challenge hosted by ${organizer}. Build a working prototype with your team, learn from fellow builders, and present your solution to a panel of mentors.\n\nExplore ${tags.join(' and ').toLowerCase()} through practical challenges. Teams will be evaluated on creativity, impact, technical execution, and the clarity of their final demo.\n\nThis is sample data for the SideQuest preview, not a real event. No actual registration is available.`,
}));
export interface HackathonsApi { list(): Promise<{ events: Hackathon[]; now: number }>; get(id:string):Promise<{ event:Hackathon|undefined; now:number }>; }
export function getStatus(event:Pick<Hackathon,'reg_start'|'reg_deadline'>,now:number): Status {
 if(now>=Date.parse(event.reg_deadline)) return 'closed';
 if(now<Date.parse(event.reg_start)) return 'upcoming';
 if(Date.parse(event.reg_deadline)-now<=72*HOUR) return 'closing-soon';
 return 'open';
}
export function countdown(event:Hackathon,now:number) {
 const status=getStatus(event,now);
 const target=Date.parse(status==='upcoming'?event.reg_start:event.reg_deadline);
 const seconds=Math.max(0,Math.floor((target-now)/1000));
 return {days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60,status};
}
export function statusLabel(event:Hackathon,now:number) {
 const status=getStatus(event,now);
 if(status==='closing-soon'&&Date.parse(event.reg_deadline)-now<=24*HOUR) return 'Closes today';
 return {upcoming:'Opens soon',open:'Registration open','closing-soon':'Closing soon',closed:'Registration closed'}[status];
}
export function filterHackathons(events:Hackathon[],filters:DiscoveryFilters,now:number) {
 const q=filters.q?.trim().toLowerCase()??'';
 const tags=filters.tags??[];
 const results=events.filter(e=>(!q||[e.title,e.organizer,e.city,...e.tags].join(' ').toLowerCase().includes(q))&&(!filters.mode||e.mode===filters.mode)&&(!filters.city||e.city===filters.city)&&(!filters.status||getStatus(e,now)===filters.status)&&e.prize_amount_inr>=(filters.prize??0)&&tags.every(tag=>e.tags.includes(tag))&&(!filters.students||e.eligibility==='College students only'));
 const match=(e:Hackathon)=>tags.filter(t=>e.tags.includes(t)).length*10+(q&&e.title.toLowerCase().includes(q)?20:0)+(getStatus(e,now)==='closed'?0:5);
 return results.sort((a,b)=>{
  if(filters.sort==='prize') return b.prize_amount_inr-a.prize_amount_inr;
  if(filters.sort==='match'&&match(a)!==match(b)) return match(b)-match(a);
  const rank=(e:Hackathon)=>getStatus(e,now)==='closed'?2:getStatus(e,now)==='upcoming'?1:0;
  return rank(a)-rank(b)||Date.parse(a.reg_deadline)-Date.parse(b.reg_deadline);
 });
}
export function activeFilterCount(filters:DiscoveryFilters) { return Number(Boolean(filters.q))+Number(Boolean(filters.mode))+Number(Boolean(filters.status))+Number(Boolean(filters.city))+Number(Boolean(filters.prize))+(filters.tags?.length??0)+Number(Boolean(filters.students)); }
export function formatPrize(amount:number) { return amount?`₹${amount.toLocaleString('en-IN')}`:'No cash prize'; }
export function formatDate(date:string) { return new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}); }
function escapeIcs(text:string) { return text.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
export function toCalendar(event:Hackathon) {
 const stamp=(s:string)=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const fold=(line:string)=>{let result='',part='';for(const char of line){if(new TextEncoder().encode(part+char).length>73){result+=part+'\r\n ';part='';}part+=char;}return result+part;};
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SideQuest//Sample Hackathons//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${event.id}@sidequest.sample`,`DTSTAMP:${stamp(event.reg_start)}`,`DTSTART:${stamp(event.start_date)}`,`DTEND:${stamp(event.end_date)}`,`SUMMARY:${escapeIcs(event.title)} (Sample event)`,`DESCRIPTION:${escapeIcs(`Fictional SideQuest sample. Registration deadline: ${event.reg_deadline}. ${event.description}`)}`,`LOCATION:${escapeIcs(event.mode==='online'?'Online':event.city)}`,'END:VEVENT','END:VCALENDAR',''].map(fold).join('\r\n');
}
import { getStatus, type Hackathon } from './hackathons';
export type QuestTab='active'|'upcoming'|'past';
export function questTab(event:Hackathon,now:number):QuestTab {
 const status=getStatus(event,now);
 return status==='closed'?'past':status==='upcoming'?'upcoming':'active';
}
export function questGroups(events:Hackathon[],saved:string[],tab:QuestTab,now:number) {
 const selected=events.filter(event=>saved.includes(event.id)&&questTab(event,now)===tab).sort((a,b)=>Date.parse(a.reg_deadline)-Date.parse(b.reg_deadline));
 return tab==='active'?[{title:'Closing soon',events:selected.filter(e=>getStatus(e,now)==='closing-soon')},{title:'Open',events:selected.filter(e=>getStatus(e,now)==='open')}]:[{title:tab==='upcoming'?'Registration opens soon':'Past deadlines',events:selected}];
}
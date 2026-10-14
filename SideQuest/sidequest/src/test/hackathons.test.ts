import { describe,expect,it } from 'vitest';
import { MOCK_HACKATHONS, HOUR, getStatus, statusLabel, countdown, filterHackathons, toCalendar } from '@/lib/hackathons';
const now=Date.parse('2026-10-14T11:00:00Z');
const base=MOCK_HACKATHONS[0];
if(!base) throw new Error('Sample data missing');
describe('Hackathon date rules',()=>{
 it('has exactly 20 fictional sample hackathons',()=>{expect(MOCK_HACKATHONS).toHaveLength(20);expect(new Set(MOCK_HACKATHONS.map(e=>e.id)).size).toBe(20);});
 it('is upcoming before registration opens',()=>{expect(getStatus({reg_start:new Date(now+HOUR).toISOString(),reg_deadline:new Date(now+100*HOUR).toISOString()},now)).toBe('upcoming');});
 it('is open when the deadline is beyond 72 hours',()=>{expect(getStatus({reg_start:new Date(now-HOUR).toISOString(),reg_deadline:new Date(now+72*HOUR+1).toISOString()},now)).toBe('open');});
 it('is closing soon at exactly 72 hours',()=>{expect(getStatus({reg_start:new Date(now-HOUR).toISOString(),reg_deadline:new Date(now+72*HOUR).toISOString()},now)).toBe('closing-soon');});
 it('is closed at the deadline',()=>{expect(getStatus({reg_start:new Date(now-HOUR).toISOString(),reg_deadline:new Date(now).toISOString()},now)).toBe('closed');});
 it('shows closes today at the 24-hour boundary',()=>{expect(statusLabel({...base,reg_deadline:new Date(now+24*HOUR).toISOString()},now)).toBe('Closes today');});
 it('ticks down one second and never goes negative',()=>{expect(countdown(base,now).seconds).toBe(0);expect(countdown(base,now+1000).seconds).toBe(59);expect(countdown(base,Date.parse(base.reg_deadline)+1).days).toBe(0);});
});
describe('Discovery filters',()=>{
 it('searches titles, organisers and tags',()=>{expect(filterHackathons(MOCK_HACKATHONS,{q:'buildverse'},now).map(e=>e.id)).toEqual(['sq-1']);});
 it('sorts best match with title matches before organiser matches',()=>{expect(filterHackathons(MOCK_HACKATHONS,{q:'orbit',sort:'match'},now).map(e=>e.id)).toEqual(['sq-19','sq-13']);});
 it('filters mode and city together',()=>{expect(filterHackathons(MOCK_HACKATHONS,{mode:'hybrid',city:'Mumbai'},now).map(e=>e.id)).toEqual(['sq-6','sq-17']);});
 it('only includes student-only eligibility when requested',()=>{expect(filterHackathons(MOCK_HACKATHONS,{students:true},now)).toHaveLength(14);});
 it('requires all selected theme tags',()=>{expect(filterHackathons(MOCK_HACKATHONS,{tags:['Blockchain','Fintech']},now).map(e=>e.id)).toEqual(['sq-6','sq-10']);});
 it('includes the minimum prize boundary and sorts highest first',()=>{expect(filterHackathons(MOCK_HACKATHONS,{prize:300000,sort:'prize'},now).map(e=>e.prize_amount_inr)).toEqual([500000,400000,300000]);});
 it('filters computed closing-soon status within 72h',()=>{expect(filterHackathons(MOCK_HACKATHONS,{status:'closing-soon'},now).map(e=>e.id)).toEqual(['sq-3','sq-7','sq-1','sq-14','sq-5']);});
});
describe('Calendar export',()=>{
 it('exports the actual sample event start and end dates',()=>{const calendar=toCalendar(base);expect(calendar).toContain('DTSTART:20261019T170000Z');expect(calendar).toContain('DTEND:20261021T170000Z');expect(calendar).toContain('SUMMARY:Buildverse 2026 (Sample event)');expect(calendar.endsWith('\r\n')).toBe(true);});
 it('escapes special characters and folds long lines to valid calendar lengths',()=>{const calendar=toCalendar({...base,title:'A, B; C\\D'});expect(calendar).toContain('SUMMARY:A\\, B\\; C\\\\D (Sample event)');expect(calendar.split('\r\n').every(line=>new TextEncoder().encode(line).length<=75)).toBe(true);});
});
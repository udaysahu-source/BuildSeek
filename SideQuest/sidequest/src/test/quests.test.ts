import { describe, expect, it } from 'vitest';
import { MOCK_HACKATHONS, HOUR } from '@/lib/hackathons';
import { questTab, questGroups } from '@/lib/quests';
const now=Date.parse('2026-10-14T11:00:00Z');
describe('Saved quest timeline',()=>{
 it('groups open registration and the 72-hour closing window as Active',()=>{const event=MOCK_HACKATHONS[0];if(!event)throw new Error('Missing fixture');expect(questTab({...event,reg_start:new Date(now-HOUR).toISOString(),reg_deadline:new Date(now+72*HOUR).toISOString()},now)).toBe('active');});
 it('keeps unopened registration in Upcoming',()=>{const event=MOCK_HACKATHONS[14];if(!event)throw new Error('Missing fixture');expect(questTab(event,now)).toBe('upcoming');});
 it('moves an event to Past exactly at its registration deadline',()=>{const event=MOCK_HACKATHONS[0];if(!event)throw new Error('Missing fixture');expect(questTab(event,Date.parse(event.reg_deadline))).toBe('past');});
 it('shows only saved events and separates Closing soon from Open',()=>{const groups=questGroups(MOCK_HACKATHONS,['sq-1','sq-2','sq-15'],'active',now);expect(groups.map(g=>g.events.map(e=>e.id))).toEqual([['sq-1'],['sq-2']]);});
});
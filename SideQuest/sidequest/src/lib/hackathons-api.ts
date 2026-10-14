import type { HackathonsApi } from './hackathons';
import { readHackathons } from './hackathons.functions';
export const hackathonsApi:HackathonsApi={
 list:()=>readHackathons({data:{}}),
 async get(id){const data=await readHackathons({data:{id}});return {event:data.events[0],now:data.now};},
};
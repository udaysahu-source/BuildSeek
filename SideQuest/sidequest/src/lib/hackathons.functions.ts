import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import type { Hackathon } from './hackathons';

export const readHackathons = createServerFn({ method: 'GET' })
 .inputValidator((input: { id?: string }) => z.object({id:z.string().max(120).optional()}).parse(input))
 .handler(async ({data}) => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error('The event board is unavailable. Please try again.');
  const client = createClient<Database>(url,key,{
   auth:{persistSession:false,autoRefreshToken:false,storage:undefined},
   global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}},
  });
  let query=client.from('hackathons').select('id,title,organizer,source,source_url,mode,city,tags,prize_amount_inr,team_min,team_max,reg_start,reg_deadline,start_date,end_date,eligibility,description,is_sample').order('reg_deadline');
  if(data.id) query=query.eq('id',data.id);
  const {data:rows,error}=await query;
  if(error) throw new Error('The event board could not load. Please try again.');
  const events:Hackathon[]=(rows??[]).map(row=>({...row,mode:z.enum(['online','offline','hybrid']).parse(row.mode)}));
  return {events,now:Date.now()};
 });
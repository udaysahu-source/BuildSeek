// @vitest-environment node
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const adminKey=process.env['SUPABASE_SERVICE_ROLE_KEY'];
describe.skipIf(!url||!key||!adminKey)('Account row isolation',()=>{
 const config={auth:{persistSession:false,autoRefreshToken:false}};
 const admin=createClient(url??'',adminKey??'',config);const users:string[]=[];const tokens:string[]=[];
 const client=(token?:string)=>createClient(url??'',key??'',{...config,global:{headers:token?{Authorization:`Bearer ${token}`}:{},fetch:(input,init)=>{const headers=new Headers(init?.headers);if(headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key??'');return fetch(input,{...init,headers});}}});
 beforeAll(async()=>{for(let n=0;n<2;n++){const email=`sidequest-test-${randomUUID()}@example.com`;const password=`Sq!${randomUUID()}9`;const created=await admin.auth.admin.createUser({email,password,email_confirm:true});if(created.error||!created.data.user)throw new Error('Test account setup failed');users.push(created.data.user.id);const signed=await client().auth.signInWithPassword({email,password});if(!signed.data.session)throw new Error('Test login failed');tokens.push(signed.data.session.access_token);}},30000);
 afterAll(async()=>{for(const id of users){await admin.from('bookmarks').delete().eq('user_id',id);await admin.auth.admin.deleteUser(id);}});
 it('allows public catalog reads without login',async()=>{const result=await client().from('hackathons').select('id');expect(result.error).toBeNull();expect(result.data?.length).toBe(20);});
 it('persists a bookmark for its owner',async()=>{const c=client(tokens[0]);const result=await c.from('bookmarks').insert({user_id:users[0],hackathon_id:'sq-1'});expect(result.error).toBeNull();const read=await c.from('bookmarks').select('hackathon_id');expect(read.data).toEqual([{hackathon_id:'sq-1'}]);});
 it('does not expose another account’s bookmarks',async()=>{const result=await client(tokens[1]).from('bookmarks').select('hackathon_id').eq('user_id',users[0]);expect(result.error).toBeNull();expect(result.data).toEqual([]);});
 it('rejects creating bookmarks for another account',async()=>{const result=await client(tokens[1]).from('bookmarks').insert({user_id:users[0],hackathon_id:'sq-2'});expect(result.error).not.toBeNull();});
 it('prevents deleting another account’s bookmarks',async()=>{await client(tokens[1]).from('bookmarks').delete().eq('user_id',users[0]);const result=await client(tokens[0]).from('bookmarks').select('hackathon_id');expect(result.data).toEqual([{hackathon_id:'sq-1'}]);});
 it('does not create extra profile storage',async()=>{const result=await admin.from('profiles').select('*');expect(result.error?.code).toBe('PGRST205');});
});
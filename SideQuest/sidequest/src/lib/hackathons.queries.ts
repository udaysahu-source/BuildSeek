import { queryOptions } from '@tanstack/react-query';
import { hackathonsApi } from './hackathons-api';
export const hackathonsQuery = queryOptions({queryKey:['hackathons'],queryFn:()=>hackathonsApi.list(),staleTime:60_000});
export function hackathonQuery(id:string) { return queryOptions({queryKey:['hackathon',id],queryFn:()=>hackathonsApi.get(id),staleTime:60_000}); }
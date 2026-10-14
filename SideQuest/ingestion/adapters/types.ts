import { Hackathon } from "@/lib/types";

export interface RawItem {
  [key: string]: any;
}

export interface SourceAdapter {
  name: string;
  fetchListings(useFixture?: boolean): Promise<RawItem[]>;
  normalize(raw: RawItem): Hackathon | null;
}

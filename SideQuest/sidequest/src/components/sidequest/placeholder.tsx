import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mascot } from './mascot';
export function Placeholder({ title, description }: { title: string; description: string }) {
 return <main className="sq-placeholder sq-container"><Link to="/" className="sq-placeholder-top"><ArrowLeft size={16} /> Back to SideQuest</Link><div className="sq-placeholder-body"><div><span className="sq-coming-tag">The next quest is loading</span><h1>{title}</h1><p>{description}</p><p>This page is coming in the next chapter. Until then, meet SideQuest.</p><div className="sq-placeholder-actions"><Button asChild><Link to="/">Back to home <ArrowUpRight size={16} /></Link></Button><Button asChild variant="outline"><Link to="/discover">Discover</Link></Button></div></div><Mascot className="sq-placeholder-mascot" /></div></main>;
}
export function pageHead(title: string, description: string) {
 return { meta: [{ title: `${title} — SideQuest` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — SideQuest` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}

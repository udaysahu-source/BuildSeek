import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/components/sidequest/placeholder';
import { AuthForm } from '@/components/sidequest/auth-form';
import { z } from 'zod';
export const Route = createFileRoute('/login')({
 component: Page,
 validateSearch:search=>z.object({next:z.enum(['/discover','/quest-log','/profile']).optional().catch(undefined)}).parse(search),
 head: () => pageHead('Log in or join the quest', 'Log in to SideQuest with Google or email and keep your saved hackathons together.'),
});
function Page() {const {next}=Route.useSearch();return <AuthForm next={next}/>;}

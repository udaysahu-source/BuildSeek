import { createFileRoute } from '@tanstack/react-router';
import { Placeholder, pageHead } from '@/components/sidequest/placeholder';
export const Route = createFileRoute('/alerts')({
 component: Page,
 head: () => pageHead('Never miss your moment', 'Timely Telegram reminders and opportunities that match your interests.'),
});
function Page() { return <Placeholder title='Never miss your moment' description='Timely Telegram reminders and opportunities that match your interests.' />; }

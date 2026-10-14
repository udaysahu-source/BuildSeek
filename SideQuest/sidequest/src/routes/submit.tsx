import { createFileRoute } from '@tanstack/react-router';
import { Placeholder, pageHead } from '@/components/sidequest/placeholder';
export const Route = createFileRoute('/submit')({
 component: Page,
 head: () => pageHead('Put your hackathon on the board', 'Bring your campus challenge to India’s student builders.'),
});
function Page() { return <Placeholder title='Put your hackathon on the board' description='Bring your campus challenge to India’s student builders.' />; }

import { createFileRoute } from '@tanstack/react-router';
import { StaticPage, pageHead } from '@/components/static-page';
import originalPage from '@/content/pages/Thank-you';

const page = { ...originalPage, routePath: '/thankyou' };

export const Route = createFileRoute('/thankyou')({
  head: () => pageHead(page),
  component: ThankYouPage,
});

function ThankYouPage() {
  return <StaticPage page={page} />;
}
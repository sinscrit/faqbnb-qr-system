import { PublishGuestPageForm } from './PublishGuestPageForm';

export const dynamic = 'force-dynamic';

export default async function CreateItemPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string | string[] }>;
}) {
  const propertyId = (await searchParams).propertyId;
  return <PublishGuestPageForm queryPropertyId={typeof propertyId === 'string' ? propertyId : null} />;
}

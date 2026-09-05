import { Redirect, useLocalSearchParams } from 'expo-router';

import { ListingDetailScreen } from '@/features/listings/ListingDetailScreen';

export default function ListingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/" />;
  }

  return <ListingDetailScreen id={id} />;
}

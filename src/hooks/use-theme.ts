import { Colors } from '@/constants/theme';

// The public site uses a fixed warm palette, including when the device is in Dark Mode.
export function useTheme() {
  return Colors.light;
}

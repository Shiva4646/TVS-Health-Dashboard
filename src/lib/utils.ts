import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEVICE_MAC_MAP = {
  "B4:3A:45:8A:2E:6C": "Device 1",
  "E4:B3:23:B4:A0:34": "Device 2",
  "54:32:04:89:95:1C": "Device 3",

} as const;

export const MAC_TO_DEVICE = Object.entries(DEVICE_MAC_MAP).reduce(
  (acc, [mac, device]) => {
    acc[mac] = device;
    return acc;
  },
  {} as Record<string, string>
);

export function getDeviceNameFromMac(mac: string): string {
  // Basic implementation - modify as needed
  return `Device ${mac.slice(-4)}`;
}

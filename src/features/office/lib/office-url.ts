export function getOfficePublicPath(name: string): string {
  return `/offices/${encodeURIComponent(name)}`;
}

export function decodeOfficeNameParam(name: string): string {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

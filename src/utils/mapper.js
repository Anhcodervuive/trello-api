export function extractPublicIdFromUrl(url) {
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

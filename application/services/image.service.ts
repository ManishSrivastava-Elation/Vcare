import { baseImageUrl } from "../apis/apis";

const getFullImageUrl = (path?: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseImageUrl}${path}`;
};

export default getFullImageUrl

export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

export function getYouTubeThumbnail(
  url: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'default' = 'hqdefault',
): string | null {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : null
}

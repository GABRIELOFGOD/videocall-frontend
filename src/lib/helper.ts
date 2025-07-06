
export function generateMeetId(): string {
  const groupLength = 4;
  const groupCount = 3;
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  function randomGroup(): string {
    let group = '';
    for (let i = 0; i < groupLength; i++) {
      group += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return group;
  }

  return Array.from({ length: groupCount }, randomGroup).join('-');
}
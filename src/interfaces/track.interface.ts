export interface Track {
  id: string; // uuid v4
  name: string;
  artistId: string | null;
  albumId: string | null;
  duration: number;
}

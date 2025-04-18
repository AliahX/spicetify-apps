import type { LocalTrack } from '@shared/platform/local-files';
import type { Album } from './album';
import type { Artist } from './artist';
import type { ITrack } from '@shared/components/track-list/models/interfaces';

/**
 * A processed local track.
 */
export class Track implements ITrack {
    /**
     * Date the track was added to the local file library.
     */
    public get addedAt(): Date | null {
        return this.localTrack.addedAt;
    }

    /**
     * Track URI.
     */
    public get uri(): string {
        return this.localTrack.uri;
    }

    /**
     * Track name.
     */
    public get name(): string {
        return this.localTrack.name;
    }

    /**
     * Duration of the track in milliseconds.
     */
    public get duration(): number {
        return this.localTrack.duration.milliseconds;
    }

    /**
     * Disc number in the album.
     */
    public get discNumber(): number {
        return this.localTrack.discNumber;
    }

    /**
     * Track number in the album.
     */
    public get trackNumber(): number {
        return this.localTrack.trackNumber;
    }

    public get backingTrack(): LocalTrack {
        return this.localTrack;
    }

    public get isPlayable(): boolean {
        return this.localTrack.isPlayable;
    }

    public get source(): string | undefined {
        return undefined;
    }

    /**
     * Create a new instance of the Track class.
     * @param localTrack The backing local track.
     * @param album The album the track belongs to.
     * @param artists The list of artists for this track.
     */
    constructor(
        private readonly localTrack: LocalTrack,
        public album: Album,
        public readonly artists: Artist[],
    ) {}
}

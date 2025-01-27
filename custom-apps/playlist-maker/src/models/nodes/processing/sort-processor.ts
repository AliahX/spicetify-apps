import { type WorkflowTrack } from '../../track';
import { TrackWrapper } from '../../track-wrapper';
import { BaseNodeDataSchema, NodeProcessor } from '../node-processor';
import { z } from 'zod';

export const OrderByDataSchema = z
    .object({
        property: z.enum(['album', 'artist', 'name', 'source', 'duration']),
        order: z.enum(['asc', 'desc']),
    })
    .merge(BaseNodeDataSchema)
    .strict();

export type OrderByData = z.infer<typeof OrderByDataSchema>;

const propertyGetter: Record<
    OrderByData['property'],
    (track: TrackWrapper) => string | number
> = {
    album: (track) => track.album.name,
    artist: (track) => track.artists.map((artist) => artist.name).join(', '),
    name: (track) => track.name,
    source: (track) => track.source,
    duration: (track) => track.duration,
};

export class SortProcessor extends NodeProcessor<OrderByData> {
    protected override async getResultsInternal(
        input: WorkflowTrack[],
    ): Promise<WorkflowTrack[]> {
        const { property, order } = this.data;

        return input.sort((a, b) => {
            const aValue = this.getPropertyValue(a, property);
            const bValue = this.getPropertyValue(b, property);

            if (aValue < bValue) {
                return order === 'asc' ? -1 : 1;
            }

            if (aValue > bValue) {
                return order === 'asc' ? 1 : -1;
            }

            return 0;
        });
    }

    private getPropertyValue(
        track: WorkflowTrack,
        property: OrderByData['property'],
    ): string | number {
        return propertyGetter[property](new TrackWrapper(track));
    }
}

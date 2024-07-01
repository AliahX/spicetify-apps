import { waitForPlatformApi } from '@shared/utils/spicetify-utils';
import { type Track } from '../../track';
import { NodeProcessor, type BaseNodeData } from '../node-processor';
import type { LocalFilesAPI } from '@shared/platform/local-files';

export type LocalTracksData = BaseNodeData & {
    filter?: string;
};

/**
 * Source node that returns local songs.
 */
export class LocalTracksSourceProcessor extends NodeProcessor<LocalTracksData> {
    public override async getResults(): Promise<Track[]> {
        this.setExecuting(true);

        const localFilesApi =
            await waitForPlatformApi<LocalFilesAPI>('LocalFilesAPI');

        const result = await localFilesApi.getTracks(
            undefined,
            this.data.filter,
        );

        this.setExecuting(false);

        return result;
    }
}

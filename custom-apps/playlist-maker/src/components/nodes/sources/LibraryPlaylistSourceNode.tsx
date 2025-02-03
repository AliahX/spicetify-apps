import type { UserAPI } from '@shared/platform/user';
import { getRootlistPlaylists } from '@shared/utils/rootlist-utils';
import { getPlatformApiOrThrow } from '@shared/utils/spicetify-utils';
import { useNodeForm } from 'custom-apps/playlist-maker/src/hooks/use-node-form';
import {
    PlaylistDataSchema,
    type PlaylistData,
} from 'custom-apps/playlist-maker/src/models/nodes/sources/my-playlists-source-processor';
import {
    setValueAsOptionalNumber,
    setValueAsOptionalString,
} from 'custom-apps/playlist-maker/src/utils/form-utils';
import { getDefaultValueForNodeType } from 'custom-apps/playlist-maker/src/utils/node-utils';
import { Music } from 'lucide-react';
import React, { useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Combobox, type ItemRendererProps } from '../../inputs/ComboBox';
import { NumberInput } from '../../inputs/NumberInput';
import { SelectController } from '../../inputs/SelectController';
import { TextInput } from '../../inputs/TextInput';
import { Node } from '../shared/Node';
import { NodeComboField } from '../shared/NodeComboField';
import { NodeContent } from '../shared/NodeContent';
import { NodeField } from '../shared/NodeField';
import { SourceNodeHeader } from '../shared/NodeHeader';
import { NodeTitle } from '../shared/NodeTitle';

const propertyValues: Record<PlaylistData['sortField'], string> = {
    ALBUM: 'Album',
    ARTIST: 'Artist',
    TITLE: 'Name',
    DURATION: 'Duration',
    ADDED_AT: 'Added at',
    ADDED_BY: 'Added by',
    PUBLISH_DATE: 'Publish date',
    SHOW_NAME: 'Show name',
    NO_SORT: 'No sort',
};

const orderValues: Record<PlaylistData['sortOrder'], string> = {
    ASC: 'Ascending',
    DESC: 'Descending',
};

type PlaylistItem = {
    id: string;
    uri: string;
    name: string;
    image: string | null;
    ownerName: string;
};

function PlaylistItemRenderer(
    props: Readonly<ItemRendererProps<PlaylistItem>>,
): JSX.Element {
    return (
        <div className="flex max-h-[80px] items-stretch gap-2">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center !p-2">
                {props.item.image && (
                    <img
                        src={props.item.image}
                        className="rounded-md object-contain"
                        alt="playlist"
                    />
                )}
                {props.item.image === null && (
                    <Music size={60} strokeWidth={1} />
                )}
            </div>

            <div className="flex min-w-0 flex-col items-stretch justify-center">
                <span
                    className={Spicetify.classnames(
                        'truncate',
                        props.isSelected ? 'font-bold' : '',
                    )}
                >
                    {props.item.name}
                </span>
                <span className="truncate text-sm">
                    by {props.item.ownerName}
                </span>
            </div>
        </div>
    );
}

export function LibraryPlaylistSourceNode(
    props: Readonly<NodeProps<PlaylistData>>,
): JSX.Element {
    const onlyMyPlaylists = props.data.onlyMine;

    const { register, errors, control } = useNodeForm<PlaylistData>(
        props.id,
        props.data,
        getDefaultValueForNodeType('libraryPlaylistSource'),
        PlaylistDataSchema,
    );

    const getPlaylists = useCallback(
        async (input: string): Promise<PlaylistItem[]> => {
            console.log(
                'getting playlists with input ',
                input,
                onlyMyPlaylists,
            );
            const userAPI = getPlatformApiOrThrow<UserAPI>('UserAPI');
            const user = await userAPI.getUser();

            let playlists = await getRootlistPlaylists(input);

            playlists = playlists.filter((p) => p.name !== '');

            if (onlyMyPlaylists) {
                playlists = playlists.filter((p) => p.owner.uri === user.uri);
            }

            playlists = playlists.toSorted((a, b) =>
                a.name.localeCompare(b.name),
            );

            console.log('playlists', playlists);

            return playlists.map((p) => ({
                id: p.uri,
                name: p.name,
                uri: p.uri,
                image:
                    p.images.length > 0
                        ? (p.images.find((i) => i.label === 'small')?.url ??
                          p.images[0].url)
                        : null,
                ownerName: p.owner.displayName,
            }));
        },
        [onlyMyPlaylists],
    );

    // TODO: remove playlistName from data
    // TODO: remove logs

    return (
        <Node isExecuting={props.data.isExecuting}>
            <SourceNodeHeader />
            <NodeContent>
                <NodeTitle title="Playlist" />

                <NodeField label="Only my playlists" error={errors.onlyMine}>
                    <input type="checkbox" {...register('onlyMine')} />
                </NodeField>

                <NodeComboField error={errors.onlyMine}>
                    <Combobox
                        fetchItems={getPlaylists}
                        itemRenderer={PlaylistItemRenderer}
                        itemToString={(item: PlaylistItem) => item.name}
                        label="Playlist"
                        placeholder="Search for a playlist"
                    />
                </NodeComboField>

                <NodeField
                    tooltip="Search filter to apply"
                    label="Filter"
                    error={errors.filter}
                >
                    <TextInput
                        placeholder="Search"
                        {...register('filter', {
                            setValueAs: setValueAsOptionalString,
                        })}
                    />
                </NodeField>

                <NodeField
                    label="Offset"
                    tooltip="Number of elements to skip"
                    error={errors.offset}
                >
                    <NumberInput
                        placeholder="0"
                        {...register('offset', {
                            setValueAs: setValueAsOptionalNumber,
                        })}
                    />
                </NodeField>

                <NodeField
                    label="Limit"
                    tooltip="Number of elements to take. Leave empty to take all elements."
                    error={errors.limit}
                >
                    <NumberInput
                        placeholder="None"
                        {...register('limit', {
                            setValueAs: setValueAsOptionalNumber,
                        })}
                    />
                </NodeField>

                <NodeField label="Sort by" error={errors.sortField}>
                    <SelectController
                        label="Property to sort on"
                        name="sortField"
                        control={control}
                        items={Object.entries(propertyValues).map(
                            ([key, label]) => ({
                                label,
                                value: key,
                            }),
                        )}
                    />
                </NodeField>
                <NodeField label="Order" error={errors.sortOrder}>
                    <SelectController
                        label="Sort order"
                        name="sortOrder"
                        control={control}
                        items={Object.entries(orderValues).map(
                            ([key, label]) => ({
                                label,
                                value: key,
                            }),
                        )}
                    />
                </NodeField>
            </NodeContent>
            <Handle
                type="source"
                position={Position.Right}
                id="result"
                style={{ top: '40px' }}
            />
        </Node>
    );
}

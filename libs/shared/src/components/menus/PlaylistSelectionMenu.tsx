import type { Playlist } from '@shared/platform/rootlist';
import { getRootlistPlaylists } from '@shared/utils/rootlist-utils';
import { getPlatform } from '@shared/utils/spicetify-utils';
import React, { useEffect, useState } from 'react';
import { Menu } from './Menu';

export type Props = {
    tracksUri: string[];
};

export function PlaylistSelectionMenu(props: Readonly<Props>): JSX.Element {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        async function getPlaylists(): Promise<void> {
            const userAPI = getPlatform().UserAPI;
            const user = await userAPI.getUser();

            const playlists = await getRootlistPlaylists();
            const userPlaylists: Playlist[] = playlists.filter(
                (p) => p.owner.uri === user.uri,
            );

            setPlaylists(userPlaylists);
        }

        void getPlaylists();
    }, []);

    async function addToPlaylist(playlistUri: string): Promise<void> {
        const playlistAPI = getPlatform().PlaylistAPI;
        await playlistAPI.add(playlistUri, props.tracksUri, { after: 'end' });
    }

    return (
        <Menu>
            {playlists.map((p) => {
                return (
                    <Spicetify.ReactComponent.MenuItem
                        onClick={async () => {
                            await addToPlaylist(p.uri);
                        }}
                        key={p.uri}
                    >
                        <span>{p.name}</span>
                    </Spicetify.ReactComponent.MenuItem>
                );
            })}
        </Menu>
    );
}

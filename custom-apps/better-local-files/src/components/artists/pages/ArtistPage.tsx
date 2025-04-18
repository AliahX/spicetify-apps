import { getPlatform } from '@shared/utils/spicetify-utils';
import { getTranslation } from '@shared/utils/translations.utils';
import { ARTISTS_ROUTE } from 'custom-apps/better-local-files/src/constants/constants';
import type { Artist } from 'custom-apps/better-local-files/src/models/artist';
import React from 'react';
import { navigateTo } from '../../../utils/history.utils';
import { Header, HeaderImage } from '../../shared/Header';
import { ArtistTrackList } from '../track-list/ArtistTrackList';

type Props = {
    artist: Artist;
};

function ArtistHeader(props: Readonly<Props>): JSX.Element {
    return (
        <Header
            image={<HeaderImage imageSrc={props.artist.image} />}
            subtitle={getTranslation(['artist'])}
            title={props.artist.name}
        />
    );
}

export function ArtistPage(): JSX.Element {
    const history = getPlatform().History;
    const state = history.location.state as { uri?: string };

    const artistUri = state.uri ?? null;

    if (artistUri === null) {
        history.replace(ARTISTS_ROUTE);
        return <></>;
    }

    const artists = window.localTracksService.getArtists();

    if (!artists.has(artistUri)) {
        navigateTo(ARTISTS_ROUTE);
        return <></>;
    }

    const artist = artists.get(artistUri)!;

    const artistTracks = window.localTracksService.getArtistTracks(artist.uri);

    return (
        <>
            <ArtistHeader artist={artist} />
            <ArtistTrackList tracks={artistTracks} artist={artist} />
        </>
    );
}

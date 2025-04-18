import type { Album } from '@shared/api/models/album';
import type { Artist } from '@shared/api/models/artist';
import type { Episode } from '@shared/api/models/episode';
import type { Playlist } from '@shared/api/models/playlist';
import type { Show } from '@shared/api/models/show';
import type { Track } from '@shared/api/models/track';
import type { ClipboardAPI } from '@shared/platform/clipboard';
import { getPlatform, waitForSpicetify } from '@shared/utils/spicetify-utils';
import { getId } from '@shared/utils/uri-utils';
import { getApiData } from '@shared/utils/web-api-utils';
import i18next from 'i18next';
import { Clipboard } from 'lucide-react';
import React from 'react';

let locale: typeof Spicetify.Locale;
let clipboardApi: ClipboardAPI;

async function getNames(uris: string[]): Promise<string[]> {
    const data = await getApiData(uris);

    const names: string[] = [];
    const invalidUris: string[] = [];

    for (const [index, item] of data.entries()) {
        if (item === null) {
            invalidUris.push(uris[index]);
        } else {
            names.push(item.name);
        }
    }

    if (invalidUris.length > 0) {
        Spicetify.showNotification(
            `Couldn't get data for URIs: ${invalidUris.join(', ')}`,
            true,
        );
    }

    return names;
}

async function getData(
    uris: string[],
): Promise<(Track | Album | Artist | Playlist | Show | Episode)[]> {
    const data = await getApiData(uris);

    const items: (Track | Album | Artist | Playlist | Show | Episode)[] = [];
    const invalidUris: string[] = [];

    for (const [index, item] of data.entries()) {
        if (item === null) {
            invalidUris.push(uris[index]);
        } else {
            items.push(item);
        }
    }

    if (invalidUris.length > 0) {
        Spicetify.showNotification(
            `Couldn't get data for URIs: ${invalidUris.join(', ')}`,
            true,
        );
    }

    return items;
}

async function copy(text: string | object): Promise<void> {
    Spicetify.showNotification(i18next.t('copied'));
    await clipboardApi.copy(text);
}

async function copyNames(uris: string[]): Promise<void> {
    const names: string[] = await getNames(uris);
    await copy(names.join(locale.getSeparator()));
}

async function copyIds(uris: string[]): Promise<void> {
    const ids = uris.map((uri) => getId(Spicetify.URI.fromString(uri)));
    await copy(ids.join(locale.getSeparator()));
}

async function copyUris(uris: string[]): Promise<void> {
    await copy(uris.join(locale.getSeparator()));
}

async function copyData(uris: string[]): Promise<void> {
    const results = await getData(uris);
    await copy(results);
}

async function main(): Promise<void> {
    await waitForSpicetify();

    clipboardApi = getPlatform().ClipboardAPI;
    locale = Spicetify.Locale;

    await i18next.init({
        lng: locale.getLocale(),
        fallbackLng: 'en',
        debug: false,
        resources: {
            en: {
                translation: {
                    copyTrack: 'Copy track',
                    copyTracks: 'Copy tracks',
                    copyAlbum: 'Copy album',
                    copyArtist: 'Copy artist',
                    copyPlaylist: 'Copy playlist',
                    copyShow: 'Copy show',
                    copyEpisode: 'Copy episode',
                    name: 'Name',
                    data: 'Data',
                    noElements: 'No element selected.',
                    copied: 'Copied to clipboard',
                },
            },
            fr: {
                translation: {
                    copyTrack: 'Copier la piste',
                    copyTracks: 'Copier les pistes',
                    copyAlbum: "Copier l'album",
                    copyArtist: "Copier l'artiste",
                    copyPlaylist: 'Copier la playlist',
                    copyShow: 'Copier le podcast',
                    copyEpisode: "Copier l'épisode",
                    name: 'Nom',
                    data: 'Données',
                    noElements: 'Aucun élément sélectionné.',
                    copied: 'Copié dans le presse-papier',
                },
            },
        },
    });

    const copyNameItem = new Spicetify.ContextMenu.Item(
        i18next.t('name'),
        (uris) => {
            void copyNames(uris);
        },
        () => true,
    );

    const copyIdItem = new Spicetify.ContextMenu.Item(
        'ID',
        (uris) => {
            void copyIds(uris);
        },
        () => true,
    );

    const copyUriItem = new Spicetify.ContextMenu.Item(
        'URI',
        (uris) => {
            void copyUris(uris);
        },
        () => true,
    );

    const copyDataItem = new Spicetify.ContextMenu.Item(
        i18next.t('data'),
        (uris) => {
            void copyData(uris);
        },
        () => true,
    );

    const icon = Spicetify.ReactDOMServer.renderToString(
        <Clipboard size={16} color="var(--text-subdued)" strokeWidth={1} />,
    );

    const createSubmenu = (
        labelKey: string,
        shouldAdd: Spicetify.ContextMenu.ShouldAddCallback,
    ): void => {
        new Spicetify.ContextMenu.SubMenu(
            i18next.t(labelKey),
            [copyNameItem, copyIdItem, copyUriItem, copyDataItem],
            shouldAdd,
            false,
            icon,
        ).register();
    };

    createSubmenu(
        'copyTrack',
        (uris) => uris.length === 1 && Spicetify.URI.isTrack(uris[0]),
    );
    createSubmenu(
        'copyTracks',
        (uris) =>
            uris.length > 1 && uris.every((uri) => Spicetify.URI.isTrack(uri)),
    );
    createSubmenu(
        'copyAlbum',
        (uris) => uris.length === 1 && Spicetify.URI.isAlbum(uris[0]),
    );
    createSubmenu(
        'copyArtist',
        (uris) => uris.length === 1 && Spicetify.URI.isArtist(uris[0]),
    );
    createSubmenu(
        'copyPlaylist',
        (uris) => uris.length === 1 && Spicetify.URI.isPlaylistV1OrV2(uris[0]),
    );
    createSubmenu(
        'copyShow',
        (uris) => uris.length === 1 && Spicetify.URI.isShow(uris[0]),
    );
    createSubmenu(
        'copyEpisode',
        (uris) => uris.length === 1 && Spicetify.URI.isEpisode(uris[0]),
    );
}

export default main;

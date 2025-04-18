import { getPlatform } from '@shared/utils/spicetify-utils';
import { useEffect, useState } from 'react';

export function useIsInLibrary(
    uri: string,
): [
    boolean | undefined,
    React.Dispatch<React.SetStateAction<boolean | undefined>>,
] {
    const [trackInLibrary, setTrackInLibrary] = useState<boolean | undefined>(
        getPlatform().LibraryAPI.containsSync(uri),
    );

    useEffect(() => {
        getPlatform()
            .LibraryAPI.contains(uri)
            .then((result) => {
                setTrackInLibrary(result[0]);
            })
            .catch(console.error);
    }, [uri]);

    return [trackInLibrary, setTrackInLibrary];
}

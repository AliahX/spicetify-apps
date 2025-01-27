import React from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import { SourceNodeHeader } from '../shared/NodeHeader';
import { Node } from '../shared/Node';
import { NodeContent } from '../shared/NodeContent';
import { TextInput } from '../../inputs/TextInput';
import { NodeField } from '../shared/NodeField';
import {
    setValueAsNumber,
    setValueAsString,
} from 'custom-apps/playlist-maker/src/utils/form-utils';
import { NumberInput } from '../../inputs/NumberInput';
import { useNodeForm } from 'custom-apps/playlist-maker/src/hooks/use-node-form';
import { NodeTitle } from '../shared/NodeTitle';
import {
    type AlbumData,
    AlbumDataSchema,
} from 'custom-apps/playlist-maker/src/models/nodes/sources/album-source-processor';
import { TextComponent } from '@shared/components/ui/TextComponent/TextComponent';

const defaultValues: AlbumData = {
    uri: '',
    limit: undefined,
    offset: undefined,
    onlyLiked: false,
    isExecuting: undefined,
};

export function AlbumSourceNode(
    props: Readonly<NodeProps<AlbumData>>,
): JSX.Element {
    const { register, errors } = useNodeForm<AlbumData>(
        props.id,
        props.data,
        defaultValues,
        AlbumDataSchema,
    );

    return (
        <Node isExecuting={props.data.isExecuting}>
            <SourceNodeHeader />
            <NodeContent>
                <NodeTitle title="Album" />

                <NodeField label="URI" tooltip="Album URI" error={errors.uri}>
                    <TextInput
                        placeholder="URI"
                        {...register('uri', {
                            setValueAs: setValueAsString,
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
                            setValueAs: setValueAsNumber,
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
                            setValueAs: setValueAsNumber,
                        })}
                    />
                </NodeField>

                <label>
                    <TextComponent elementType="small">
                        Only liked
                    </TextComponent>
                    <input type="checkbox" {...register('onlyLiked')} />
                </label>
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

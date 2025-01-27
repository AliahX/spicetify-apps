import { useNodeForm } from 'custom-apps/playlist-maker/src/hooks/use-node-form';
import {
    AcousticnessDataSchema,
    MAX_ACOUSTICNESS,
    MIN_ACOUSTICNESS,
    type AcousticnessData,
} from 'custom-apps/playlist-maker/src/models/nodes/filter/acousticness-processor';
import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { SliderController } from '../../inputs/SliderController';
import { Node } from '../shared/Node';
import { NodeContent } from '../shared/NodeContent';
import { FilterNodeHeader } from '../shared/NodeHeader';
import { NodeTitle } from '../shared/NodeTitle';

const defaultValues: AcousticnessData = {
    range: {
        min: MIN_ACOUSTICNESS,
        max: MAX_ACOUSTICNESS,
    },
    isExecuting: undefined,
};

export function AcousticnessNode(
    props: Readonly<NodeProps<AcousticnessData>>,
): JSX.Element {
    const { control } = useNodeForm<AcousticnessData>(
        props.id,
        props.data,
        defaultValues,
        AcousticnessDataSchema,
    );

    return (
        <Node isExecuting={props.data.isExecuting}>
            <FilterNodeHeader />
            <NodeContent>
                <div
                    style={{
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        paddingBottom: '8px',
                    }}
                >
                    <NodeTitle
                        title="Acousticness"
                        tooltip="A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 
                        1.0 represents high confidence the track is acoustic."
                    />

                    <SliderController
                        control={control}
                        min={MIN_ACOUSTICNESS}
                        max={MAX_ACOUSTICNESS}
                        step={0.01}
                    />
                </div>
            </NodeContent>
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                style={{ top: '42px' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="input"
                style={{ top: '42px' }}
            />
        </Node>
    );
}

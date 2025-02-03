import React, { type ForwardedRef, forwardRef } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import styles from './TextInput.module.scss';

export type Props = {
    placeholder: string;
    className?: string;
} & ReturnType<UseFormRegister<any>>;

export const TextInput = forwardRef(function TextInput(
    props: Readonly<Props>,
    ref: ForwardedRef<HTMLInputElement>,
): JSX.Element {
    return (
        <input
            className={Spicetify.classnames(
                styles['text-input'],
                props.className,
            )}
            type="text"
            placeholder={props.placeholder}
            ref={ref}
            name={props.name}
            onChange={props.onChange}
            onBlur={props.onBlur}
        />
    );
});

import { getPlatform } from '@shared/utils/spicetify-utils';
import React, { useEffect, useState } from 'react';
import { type HistoryEntry } from '../../platform/history';

function isSideBarCollapsed(): boolean {
    return getPlatform().LocalStorageAPI.getItem('ylx-sidebar-state') === 1;
}

function isLibraryXEnabled(sidebar: HTMLElement): boolean {
    return (
        sidebar.classList.contains('hasYLXSidebar') ||
        !!sidebar.querySelector('.main-yourLibraryX-entryPoints')
    );
}

export type NavBarLinkProps = {
    icon: JSX.Element;
    activeIcon: JSX.Element;
    href: string;
    label: string;
};

export function NavBarLink(props: Readonly<NavBarLinkProps>): JSX.Element {
    const history = getPlatform().History;
    const initialActive = history.location.pathname === props.href;
    const sidebar = document.querySelector<HTMLDivElement>('.Root__nav-bar');

    if (sidebar === null) {
        throw new Error('Could not find sidebar');
    }

    const href = props.href;

    const [active, setActive] = useState(initialActive);
    const [isLibX, setIsLibX] = useState(isLibraryXEnabled(sidebar));
    const [isCollapsed, setIsCollapsed] = useState(isSideBarCollapsed());

    useEffect(() => {
        function handleHistoryChange(e: HistoryEntry): void {
            setActive(e.pathname === href);
        }

        const history = getPlatform().History;
        const unsubscribe = history.listen(handleHistoryChange);
        return unsubscribe;
    }, [href]);

    useEffect(() => {
        // From https://github.dev/spicetify/spicetify-cli/blob/master/jsHelper/sidebarConfig.js
        // Check if library X has been enabled / disabled in experimental settings
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    if (isLibraryXEnabled(mutation.target as HTMLElement)) {
                        setIsLibX(true);
                    } else {
                        setIsLibX(false);
                    }
                }
            }
        });

        observer.observe(sidebar, {
            childList: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, [sidebar]);

    useEffect(() => {
        // Observe sidebar width changes
        const observer = new ResizeObserver(() => {
            setIsCollapsed(isSideBarCollapsed());
        });

        observer.observe(sidebar);

        return () => {
            observer.disconnect();
        };
    }, [sidebar]);

    function navigate(): void {
        history.push(props.href);
    }

    if (isLibX) {
        const link = (
            <a
                draggable="false"
                href="#"
                aria-label={props.label}
                className={`link-subtle main-yourLibraryX-navLink ${
                    active ? 'main-yourLibraryX-navLinkActive active' : ''
                }`}
                onClick={navigate}
            >
                {props.icon}
                {props.activeIcon}
                {!isCollapsed && (
                    <span className="TypeElement-balladBold-type">
                        {props.label}
                    </span>
                )}
            </a>
        );

        return (
            <li
                className="main-yourLibraryX-navItem InvalidDropTarget"
                data-id={props.href}
            >
                {isCollapsed ? (
                    <Spicetify.ReactComponent.TooltipWrapper
                        label={props.label}
                        showDelay={100}
                        placement="right"
                    >
                        {link}
                    </Spicetify.ReactComponent.TooltipWrapper>
                ) : (
                    link
                )}
            </li>
        );
    } else {
        return (
            <li className="main-navBar-navBarItem" data-id={props.href}>
                <a
                    draggable="false"
                    className={`link-subtle main-navBar-navBarLink ${
                        active ? 'main-navBar-navBarLinkActive active' : ''
                    }`}
                    onClick={navigate}
                >
                    <div className="icon collection-icon">{props.icon}</div>
                    <div className="icon collection-active-icon">
                        {props.activeIcon}
                    </div>
                    <span className="ellipsis-one-line main-type-mestoBold">
                        {props.label}
                    </span>
                </a>
            </li>
        );
    }
}

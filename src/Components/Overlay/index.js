import React, { cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import getScrollBarSize from "rc-util/lib/getScrollBarSize"
import { injectCSS, updateCSS, removeCSS } from 'rc-util/lib/Dom/dynamicCSS'
// import Portal from '@rc-component/portal';

var _ = require('lodash');

/*----------------------------------------------------------------------------------*/
export function useWindowDimensions() {

    const hasDocument = typeof document?.documentElement !== 'undefined';
    const hasWindow = typeof window !== 'undefined';

    function getWindowDimensions() {
        const clientWidth = hasDocument ? document.documentElement.clientWidth : null;
        const clientHeight = hasDocument ? document.documentElement.clientHeight : null;
        const innerWidth = hasWindow ? window.innerWidth : null;
        const innerHeight = hasWindow ? window.innerHeight : null;
        return {
            clientWidth,
            clientHeight,
            innerWidth,
            innerHeight
        };
    }

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        if (hasWindow) {
            function handleResize() {
                setWindowDimensions(getWindowDimensions());
            }

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [hasWindow]);

    return windowDimensions;
}
// export function useWindowDimensions() {
//     // the 3rd parameter is optional and only needed for server side rendering
//     return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
// }
// function subscribe(callback) {
//     window.addEventListener('resize', callback);
//     return () => window.removeEventListener('resize', callback);
// }
// function getSnapshot() {
//     return { width: window.innerWidth, height: window.innerHeight };
// }
// function getServerSnapshot() {
//     return {
//         width: 0,
//         height: 0,
//     };
// }
/*----------------------------------------------------------------------------------*/

// var properties = [
//     'direction',  // RTL support
//     'boxSizing',
//     'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
//     'height',
//     'overflowX',
//     'overflowY',  // copy the scrollbar for IE

//     'borderTopWidth',
//     'borderRightWidth',
//     'borderBottomWidth',
//     'borderLeftWidth',
//     'borderStyle',

//     'paddingTop',
//     'paddingRight',
//     'paddingBottom',
//     'paddingLeft',

//     // https://developer.mozilla.org/en-US/docs/Web/CSS/font
//     'fontStyle',
//     'fontVariant',
//     'fontWeight',
//     'fontStretch',
//     'fontSize',
//     'fontSizeAdjust',
//     'lineHeight',
//     'fontFamily',

//     'textAlign',
//     'textTransform',
//     'textIndent',
//     'textDecoration',  // might not make a difference, but better be safe

//     'letterSpacing',
//     'wordSpacing',

//     'tabSize',
//     'MozTabSize'

// ];

// var isBrowser = (typeof window !== 'undefined');
// var isFirefox = (isBrowser && window.mozInnerScreenX != null);

// function getCaretCoordinates(element, position, options) {
//     if (!isBrowser) {
//         throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
//     }

//     var debug = options && options.debug || false;
//     if (debug) {
//         var el = document.querySelector('#input-textarea-caret-position-mirror-div');
//         if (el) el.parentNode.removeChild(el);
//     }

//     // The mirror div will replicate the textarea's style
//     var div = document.createElement('div');
//     div.id = 'input-textarea-caret-position-mirror-div';
//     document.body.appendChild(div);

//     var style = div.style;
//     var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9
//     var isInput = element.nodeName === 'INPUT';

//     // Default textarea styles
//     style.whiteSpace = 'pre-wrap';
//     if (!isInput)
//         style.wordWrap = 'break-word';  // only for textarea-s

//     // Position off-screen
//     style.position = 'absolute';  // required to return coordinates properly
//     if (!debug)
//         style.visibility = 'hidden';  // not 'display: none' because we want rendering

//     // Transfer the element's properties to the div
//     properties.forEach(function (prop) {
//         if (isInput && prop === 'lineHeight') {
//             // Special case for <input>s because text is rendered centered and line height may be != height
//             if (computed.boxSizing === "border-box") {
//                 var height = parseInt(computed.height);
//                 var outerHeight =
//                     parseInt(computed.paddingTop) +
//                     parseInt(computed.paddingBottom) +
//                     parseInt(computed.borderTopWidth) +
//                     parseInt(computed.borderBottomWidth);
//                 var targetHeight = outerHeight + parseInt(computed.lineHeight);
//                 if (height > targetHeight) {
//                     style.lineHeight = height - outerHeight + "px";
//                 } else if (height === targetHeight) {
//                     style.lineHeight = computed.lineHeight;
//                 } else {
//                     style.lineHeight = 0;
//                 }
//             } else {
//                 style.lineHeight = computed.height;
//             }
//         } else {
//             style[prop] = computed[prop];
//         }
//     });

//     if (isFirefox) {
//         // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
//         if (element.scrollHeight > parseInt(computed.height))
//             style.overflowY = 'scroll';
//     } else {
//         style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
//     }

//     div.textContent = element.value.substring(0, position);
//     // The second special handling for input type="text" vs textarea:
//     // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
//     if (isInput)
//         div.textContent = div.textContent.replace(/\s/g, '\u00a0');

//     var span = document.createElement('span');
//     // Wrapping must be replicated *exactly*, including when a long word gets
//     // onto the next line, with whitespace at the end of the line before (#7).
//     // The  *only* reliable way to do that is to copy the *entire* rest of the
//     // textarea's content into the <span> created at the caret position.
//     // For inputs, just '.' would be enough, but no need to bother.
//     span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
//     div.appendChild(span);

//     // let origin = computed['perspectiveOrigin'].split(" ");
//     var coordinates = {
//         top: span.offsetTop + parseInt(computed['borderTopWidth']),
//         left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
//         height: parseInt(computed['lineHeight']),
//         // originLeft: (origin.length >= 2)?parseInt(origin[0]):0,
//         // originTop: (origin.length >= 2)?parseInt(origin[1]):0,
//     };

//     if (debug) {
//         span.style.backgroundColor = '#aaa';
//     } else {
//         document.body.removeChild(div);
//     }

//     return coordinates;
// }

export function Overlay(props) {
    const { open, setOpen, overlayStyle, contentStyle, contentClassName, children, disableScrollLocker } = props;

    const handleKeyDown = useCallback(
        async (ev) => {
            switch (ev.code) {
                // case "ArrowDown":
                //     ev.preventDefault();
                //     ev.stopPropagation();
                //     setSelectedItem(o => {
                //         if (!items || items.length <= 0) return;
                //         const index = items.findIndex(e => e.key === o.key);
                //         if (index >= 0 && index + 1 <= items.length - 1) {
                //             elements.current[index + 1]?.scrollIntoView({
                //                 block: "nearest"
                //             });
                //             return items[index + 1]
                //         }
                //         return o;
                //     })
                //     break;
                // case "ArrowUp": {
                //     ev.preventDefault();
                //     ev.stopPropagation();
                //     setSelectedItem(o => {
                //         if (!items || items.length <= 0) return;
                //         const index = items.findIndex(e => e.key === o.key);
                //         if (index >= 0 && index - 1 >= 0) {
                //             elements.current[index - 1]?.scrollIntoView({
                //                 block: "nearest"
                //             });
                //             return items[index - 1]
                //         }
                //         return o;
                //     })
                //     break;
                // }
                // case "NumpadEnter":
                // case "Enter": {
                //     ev.preventDefault();
                //     ev.stopPropagation();
                //     const item = items.find(e => e.key === selectedItem.key);
                //     if (item) {
                //         handleAction(item);
                //     }
                //     break;
                // }
                case "Escape": {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setOpen(false);
                    break;
                }
            }
        },
        []
    );

    const [scrollLocked, setScrollLocked] = useState();
    useEffect(() => {
        const randomId = `scrollbar-lock-${Math.random()
            .toString(36)
            .substring(7)}`;
        if (!disableScrollLocker && open && !scrollLocked) {
            setScrollLocked(randomId);
            const scrollBarSize = getScrollBarSize();
            var domNode = updateCSS(`html body { overflow: hidden; width: calc(100% - ${scrollBarSize}px); }`, randomId)
        }
        if (!disableScrollLocker && !open) {
            if (scrollLocked) {
                removeCSS(scrollLocked);
                setScrollLocked();
            }
        }
        return () => {
            if (scrollLocked) {
                removeCSS(scrollLocked);
                setScrollLocked();
            }
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown, true);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [open, handleKeyDown]);

    const contentRef = useRef(null);

    const renderChildren = useCallback((opened) => {
        if (children) {
            if (isValidElement(children)) {
                return <div>
                    {cloneElement(children, {
                        // onMouseEnter: () => {
                        //     // setSelectedItem(item)
                        // },
                        // onClick: (ev) => {
                        //     ev.stopPropagation();
                        //     // handleAction(item);
                        // },
                        // ref: (node) => {
                        //     return (elements.current[index] = node)
                        // }
                        isFullscreen: opened,
                        openFullscreen: () => { setOpen(true) },
                        closeFullscreen: () => { setOpen(false) }
                    })}
                </div>
            }
        }
    }, [children, setOpen])
    return (
        <div>
            {!open && renderChildren(false)}
            {open &&
                ReactDOM.createPortal(
                    <React.Fragment>
                        <div
                            style={{
                                position: "fixed",
                                inset: "0",
                                zIndex: "100",

                                ...(overlayStyle) ? overlayStyle : {}
                            }}
                        >
                            <div
                                style={{
                                    padding: "5px",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    height: "100%",
                                    width: "100%",
                                }}>
                                <div ref={contentRef} className={contentClassName}
                                    style={{
                                        position: "relative",

                                        width: "100%",
                                        height: "100%",
                                        overflowY: "auto",
                                        overflowX: "hidden",

                                        padding: "5px",
                                        backgroundColor: "white",
                                        borderRadius: "4px",

                                        ...(contentStyle) ? contentStyle : {}
                                    }}>
                                    {renderChildren(true)}
                                </div>
                            </div>

                        </div>
                    </React.Fragment>,
                    document.body
                )
            }
        </div>
    );
};
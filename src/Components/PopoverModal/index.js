import { Modal } from "antd";
import React, { cloneElement, isValidElement, useCallback, useRef } from "react";
const { useState } = React;

export function PopoverModal(props) {
    const { children, trigger, open, setOpen, width } = props;
    // const [open, setOpen] = useState(false);
    // const ref = useRef(null)

    const [bounding, setBounding] = useState();

    const renderTrigger = useCallback(() => {
        if (trigger) {
            if (isValidElement(trigger)) {
                return cloneElement(trigger, {
                    // onClick: (e) => {
                    //     e.stopPropagation();
                    //     // console.log(ref.current.getBoundingClientRect())
                    //     console.log(e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().top)
                    //     // setBounding(e.target.getBoundingClientRect())
                    //     // setOpen(o => !o);
                    // },
                    // ref: ref,
                    // ref: (node) => {
                    //     return (ref.current = node)
                    // },
                    setBounding: setBounding
                })
            }
        }
    }, [trigger, setOpen])

    return (
        <React.Fragment>
            {renderTrigger()}
            {/* <div ref={ref} onClick={(e) => {
                console.log(ref.current.getBoundingClientRect())
                console.log(e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().top)
                setOpen(o=>!o)
            }}>
                {trigger}
            </div> */}
            <Modal
                {...props}
                mask={false}
                closable={false}
                width={width || 320}
                style={{
                    margin: 0,
                    top: (bounding?.top || 0) + (bounding?.height || 0) + 5,
                    left: (bounding?.left || 0) + (bounding?.width || 0) - (width || 320),
                }}
                footer={false}
                open={open}
                onCancel={() => setOpen(false)}
            >
                {children}
            </Modal>
        </React.Fragment>
    );
};
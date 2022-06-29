import { createUseStyles } from 'react-jss'

export default function useStyles() {
    return createUseStyles({
        modal: {
            '& .ant-modal-title': {
                marginRight: "25px"
            },
        },
        fullModal: {
            "& .am-modal-footer": {
                //position: "fixed",
                // bottom: 0,
                // left: 0,
                width: "100%",
                backgroundColor: "white",
                zIndex: 1
            },
            '& .am-modal-content': {
                textAlign: "initial",
                display: "flex",
                flexDirection: "column"
            }
        },
        Act: {
            '&.am-list-item .am-list-line .am-list-brief': {
                textAlign: "left",
                paddingTop: "0px",
                paddingBottom: "14px",
                fontWeight: "300",
                fontSize: "16px",
                marginTop: "0px"
            },
            '&.am-list-item .am-list-line .am-list-content': {
                fontSize: "14px",
                paddingBottom: "0px",
            },
            '&.am-list-item .am-list-line .am-list-arrow': {
                position: "absolute",
                right: "0",
                top: "3px",
            },
            '&.am-list-item': {
                paddingLeft: "0px"
            },
            '&.am-list-item .am-list-line': {
                padding: "0px",
                display: "block",
            },
            '&.am-list-item .am-list-line::after': {
                backgroundColor: "transparent!important"
            }
        },
        Obj: {
            '& .am-list-line': {
                display: "block",
            },
            '&.am-list-item .am-list-line .am-list-content': {
                fontSize: "14px",
                paddingBottom: "0px",
            },
            '&.am-list-item .am-list-line .am-list-arrow': {
                position: "absolute",
                right: "0",
                top: "16px",
            },
            '&.am-list-item .am-list-line .am-list-extra': {
                textAlign: "left",
                paddingTop: "0px",
            },

            '&.am-list-item': {
                paddingLeft: "0px"
            },
            '&.am-list-item .am-list-line': {
                paddingRight: "0px"
            },
            '&.am-list-item .am-list-line::after': {
                backgroundColor: "transparent!important"
            }
        },
        Steps: {
            '&.am-steps': {
                paddingTop: "5px"
            },
            '&.am-steps .am-steps-item .am-steps-item-content': {
                marginTop: "0px"
            },
            '&.am-steps .am-steps-item-description': {
                fontSize: "12px",
                color: "#bbb",
                marginRight: "5px"
            }
        },
        fieldName: {
            fontWeight: "300"
        },
        fieldValue: {
            fontStyle: "italic",
            color: "black",
            fontWeight: "300"
        },
        Result: {
            '& .ant-result-extra': {
                margin: 0,
                fontSize: "16px"
            }
        }
    })()
}
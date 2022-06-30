import React, {  } from 'react';
import 'moment/locale/ru';

export default function BlockHeaderMobile(props) {
    const { title, extra, style } = props;
    return (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", marginTop: "10px", paddingRight: "10px", ...style }}>
            <div style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, 'Open Sans', 'Helvetica Neue', 'Noto Sans Armenian', 'Noto Sans Bengali', 'Noto Sans Cherokee', 'Noto Sans Devanagari', 'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Hebrew', 'Noto Sans Kannada', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Osmanya', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', sans-serif",
                fontSize: "13px",
                fontWeight: "600",
                color: "rgb(0, 0, 0)",
            }}>
                {title}
            </div>
            <div style={{ flex: "auto", margin: "10px 10px", height: "1px", backgroundColor: "#f0f0f0" }}></div>
            {extra}
        </div>
    );
}
import React from 'react';
import ReactDOM from 'react-dom';

export default class RenderToLayer extends React.Component {
    stop = e => e.stopPropagation();
    render() {
        return ReactDOM.createPortal(
            <div
                ref={this.handleLayer}
                onClick={this.stop}
                onContextMenu={this.stop}
                onDoubleClick={this.stop}
                onDrag={this.stop}
                onDragEnd={this.stop}
                onDragEnter={this.stop}
                onDragExit={this.stop}
                onDragLeave={this.stop}
                onDragOver={this.stop}
                onDragStart={this.stop}
                onDrop={this.stop}
                onMouseDown={this.stop}
                onMouseEnter={this.stop}
                onMouseLeave={this.stop}
                onMouseMove={this.stop}
                onMouseOver={this.stop}
                onMouseOut={this.stop}
                onMouseUp={this.stop}

                onKeyDown={this.stop}
                onKeyPress={this.stop}
                onKeyUp={this.stop}

                onFocus={this.stop}
                onBlur={this.stop}

                onTouchStart={this.stop}
                onTouchEnd={this.stop}
                onTouchMove={this.stop}
                onTouchCancel={this.stop}

                onChange={this.stop}
                onInput={this.stop}
                onInvalid={this.stop}
                onSubmit={this.stop}
            >
                {this.props.children}
            </div>, document.body)
    }
}

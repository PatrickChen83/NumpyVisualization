import React, { PropTypes } from 'react';
import Animations from './animations';

function getWidth() {
    if(self.innerWidth) {
        return self.innerWidth;
    }

    if(document.documentElement && document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }

    if(document.body) {
        return document.body.clientWidth;
    }
}

function getHeight() {
    if(self.innerHeight) {
        return self.innerHeight;
    }

    if(document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }

    if(document.body) {
        return document.body.clientHeight;
    }
}

export default class SVG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 0,
        };
        this.helpMessageWidth = 500;
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions() {
        console.log(getHeight());
        this.setState({
            screenWidth: getWidth(),
            screenHeight: getHeight(),
        });
    }

    getRenderObject() {
        const currentNode = this.props.currentNode;
        if(currentNode.type !== 'array') return null;
        if(currentNode.identifier.startsWith('Call:')) {
            return Animations[currentNode.identifier.split(':')[1]];
        } else if(currentNode.identifier.startsWith('Name:')) {
            return Animations.name;
        }
    }

    render() {
        const width = this.state.screenWidth * 0.7;
        const renderObject = this.getRenderObject();
        return(
            <svg id={this.props.id} width={width} height={this.props.height}>
                <g id={`${this.props.id}Stage`} transform={`translate(${(width - this.helpMessageWidth) / 2}, ${this.props.height / 2})`}>
                    {renderObject.obj}
                </g>
                <g transform={`translate(${width - this.helpMessageWidth}, 0)`}>
                    <rect x="0" y="0" width={this.helpMessageWidth} height={this.props.height} style={{ fill: 'white' }} />
                    <foreignObject id="foo" height={this.props.height} width={this.helpMessageWidth} y="0" x="0">
                        <div xmlns="http://www.w3.org/1999/xhtml" className="SVGMessage" id={`${this.props.id}Message`}>
                            <h1>{renderObject.helpTitle}</h1>
                            {renderObject.helpMessage.map((v, i) => <p key={i}>{v}</p>)}
                        </div>
                    </foreignObject>
                </g>
                <line x1={width - this.helpMessageWidth} y1="10" x2={width - this.helpMessageWidth} y2={this.props.height - 10} strokeWidth="1" stroke="black" />
            </svg>
        );
    }
}

SVG.propTypes = {
    id: PropTypes.string.isRequired,
    height: PropTypes.number,
    currentNode: PropTypes.object, // eslint-disable-line
};

SVG.defaultProps = {
    height: 500,
    currentNode: {
        dim: [2, 3],
        col_e: 14,
        col_s: 0,
        type: 'array',
        children: [{
            type: 'tuple',
            value: '(2, 3)',
        }],
        identifier: 'Call:np.ones',
    },
};
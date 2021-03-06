import React from 'react';
import { Segment, Header, Grid, Table, Button, Input, Icon } from 'semantic-ui-react';
// import CodeMirror from 'react-codemirror';
import SVG from '../svg';
import { isNaturalNum, displayNodeDFS } from './../utils';

import MyArray from './../components/MyArray';

export default class VisUIPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            curArrName: '',
            curArrShape: '',
            arrList: [],
            npCmd: '',
            displayNode: [],
            timeStep: -1,
            isInputFocused: false,
            errorMessage: '',
        };

        this.onNpCmdChange = this.onNpCmdChange.bind(this);
        this.onArrNameChange = this.onArrNameChange.bind(this);
        this.onArrShapeChange = this.onArrShapeChange.bind(this);
        // this.onNpCmdChange = this.onNpCmdChange.bind(this);
        this.onClickAddNewArr = this.onClickAddNewArr.bind(this);
        this.onClickVisualize = this.onClickVisualize.bind(this);
        this.arrCheckValid = this.arrCheckValid.bind(this);
        this.onClickRmArr = this.onClickRmArr.bind(this);

        this.incrementTimeStep = this.incrementTimeStep.bind(this);
        this.onInputBlur = this.onInputBlur.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
    }

    // onNpCmdChange(npCmdScript) {
    //     console.log(npCmdScript);
    //     this.setState({ npCmdScript: npCmdScript });
    // }

    onNpCmdChange(e) {
        if(this.state.displayNode.length !== 0) {
            this.setState({
                displayNode: [],
                timeStep: -1,
                npCmd: e.target.value,
                errorMessage: '',
            });
        } else {
            this.setState({ npCmd: e.target.value, errorMessage: '' });
        }
    }

    onArrNameChange(e) {
        this.setState({ curArrName: e.target.value });
    }

    onArrShapeChange(e) {
        this.setState({ curArrShape: e.target.value });
    }

    arrCheckValid(arrList, curArrName, curArrShape) {
        if (curArrShape[0] !== '(' || curArrShape[(curArrShape.length - 1)] !== ')') {
            return 0;
        } else {
            const shapeSplitByComma = curArrShape.substr(1, (curArrShape.length - 2)).split(',');
            // console.log(shapeSplitByComma);
            if (!(shapeSplitByComma.length === 2 && isNaturalNum(shapeSplitByComma[0])
             && shapeSplitByComma[1].trim() === '')) {
                for (let i = 0; i < shapeSplitByComma.length; ++i) {
                    if (!isNaturalNum(shapeSplitByComma[i])) {
                        return 0;
                    }
                }
            }
        }

        // console.log(arrList.length);

        for (let i = 0; i < arrList.length; ++i) {
            if (arrList[i].name === curArrName) {
                if (arrList[i].shape === curArrShape) {
                    return 1;
                } else {
                    return (i + 3);
                }
            }
        }

        return 2;
    }

    onClickAddNewArr() {
        // console.warn("Not implemented yet...")
        const { curArrName, curArrShape, arrList } = this.state;

        const caseIdx = this.arrCheckValid(arrList, curArrName, curArrShape);
        // console.log(caseIdx);
        switch(caseIdx) {
            case 0:
                alert('Shape specification is wrong...');
                break;
            case 1:
                alert('An array with same name and shape has already been declared.')
                break;
            case 2:
                const newArrList = [...arrList, {name: curArrName, shape: curArrShape.replace(/ /gi, '')}];
                this.setState({ arrList: newArrList });
                break;
            default:
                if (confirm('This array\'s name exsit, will overwrite the value if you click yes.')) {
                    let newArrList = arrList;
                    // console.log(newArrList[caseIdx]);
                    newArrList[(caseIdx - 3)].shape = curArrShape.replace(/ /gi, '');
                    this.setState({ arrList: newArrList });
                }
                break;
        }

        this.setState({ curArrName: '', curArrShape: '' });
    }

    onClickRmArr(e, arrIdx) {
        const { arrList } = this.state;
        let newArrList = arrList;
        newArrList.splice(arrIdx, 1);
        this.setState({ arrList: newArrList });
    }

    onClickVisualize() {
        var visReqHeaders = new Headers();
        visReqHeaders.append("Content-Type", "application/json");

        const { arrList, npCmd } = this.state;
        let visObj = { code: npCmd, predefined: '' }
        const predefined = arrList.map((arr, i) => {
            const { name, shape } = arr;
            const dim = shape.substr(1, (shape.length - 2)).split(',')
                .map((num, j) => { return parseInt(num); });
            return ({
                name: name,
                type: 'array',
                dim: dim,
            });
        });
        visObj.predefined = predefined;

        var visReq = {
            method: 'POST',
            headers: visReqHeaders,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(visObj),
        };

        fetch('http://127.0.0.1:5000', visReq)
            .then(res => {
                return res.json();
            })
            .then(nodeObj => {
                console.log(nodeObj);
                if (nodeObj.status === 'ok') {
                    const rootNode = nodeObj.result;
                    let displayNode = displayNodeDFS(rootNode.children);
                    displayNode.push(rootNode);
                    console.log(displayNode);
                    this.setState({ displayNode: displayNode, timeStep: 0, errorMessage: '' });
                    setTimeout(this.incrementTimeStep, 7000);
                } else if(nodeObj.status === 'failed') {
                    this.setState({ errorMessage: nodeObj.result });
                }
            });
    }

    // =============== rendering ===============
    renderBtn(content, onClickFunc, icon='world') {
        return (
            <Button
                fluid basic positive
                icon={ `${icon}` } labelPosition='right'
                style={{ textAlign:'left', height: '56px' }}
                onClick={ onClickFunc }
                content = { `${content}` }
            >
            </Button>
        );
    }

    renderInitArr(placeholder, inputOnChange, inputValue) {
        return (
            <div style={{ margin: '20px auto', padding: '5px 0' }}>
                <Input
                    transparent placeholder= {`${placeholder}`}
                    style={{ borderBottom: '1px solid black', fontSize: '15px', width: '100%' }}
                    onChange={ inputOnChange }
                >
                    <input
                        style={{ textAlign: 'center' }}
                        value={ inputValue }
                    />
                </Input>
            </div>
        );
    }

    renderArr() {
        const arrList = this.state.arrList;
        if (arrList.length === 0) {
            return (
                <Table.Row>
                    <Table.Cell></Table.Cell>
                </Table.Row>
            );
        } else {
            return (
                arrList.map((arr, i) => {
                    return (
                        <MyArray
                            key={ i }
                            arrIdx={ i }
                            name={ arr.name }
                            shape={ arr.shape }
                            onClickRmArr = { this.onClickRmArr }
                        />
                    );
                })
            );
        }
    }

    renderArrTable() {
        return (
            <Table compact celled color='blue'>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Array</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Shape</Table.HeaderCell>
                        <Table.HeaderCell />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { this.renderArr() }
                </Table.Body>
            </Table>
        );
    }

    onInputFocus() {
        this.setState({ isInputFocused: true });
    }
    onInputBlur() {
        this.setState({ isInputFocused: false });
    }


    renderNpCmd() {
        if(this.state.npCmd === '' || this.state.isInputFocused) {
            return (
                <div style={{ fontSize: '20px' }}>
                    NumPy expression :
                    <Input
                      transparent
                      placeholder="type command here..."
                      style={{ borderBottom: '1px solid black', fontSize: '20px', width: '70%', fontFamily: 'Open Sans' }}
                      onChange={this.onNpCmdChange}
                      onBlur={this.onInputBlur}
                      onFocus={this.onInputFocus}
                      autoFocus
                    >
                        <input
                            style={{ textAlign: 'center' }}
                            value={ this.state.npCmd }
                        />
                    </Input>
                </div>
            );
        }

        let { npCmd } = this.state;
        if(this.state.displayNode.length > 0 &&
            this.state.timeStep >= 0
        ) {
            const currentNode = this.state.displayNode[this.state.timeStep];
            if(currentNode.col_e >= 0 && currentNode.col_s >= 0) {
                npCmd = npCmd.slice(0, currentNode.col_s) +
                   '<span class="currentCmd"><b>' +
                   npCmd.slice(currentNode.col_s, currentNode.col_e) +
                   '</b></span>' +
                   npCmd.slice(currentNode.col_e);
            }
        }
        return (
            <div style={{ fontSize: '20px' }}>
                <p onClick={this.onInputFocus} dangerouslySetInnerHTML={{ __html: npCmd }} />
                {
                    ((this.state.errorMessage === '') ? null : <p style={{color: 'red'}}>{this.state.errorMessage}</p>)
                }
            </div>
        );
    }

    renderSVG() {
        const { displayNode, timeStep } = this.state;
        if(timeStep < 0 || !displayNode) return null;
        return <SVG currentNode={displayNode[timeStep]} id="svg" />;
    }

    incrementTimeStep() {
        const { timeStep, displayNode } = this.state;
        console.log(timeStep);

        if (timeStep === -1 || timeStep === displayNode.length - 1) return;
        this.setState({timeStep: timeStep + 1});
        setTimeout(this.incrementTimeStep, 7000);
    }

    render() {
        return (
            <div>
                <Grid divided style={{ margin: 0 }}>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            { this.renderArrTable() }
                        </Grid.Column>
                        <Grid.Column width={3}>
                            { this.renderInitArr('Array name', this.onArrNameChange, this.state.curArrName) }
                            { this.renderInitArr('Array shape', this.onArrShapeChange, this.state.curArrShape) }
                            { this.renderBtn('add', this.onClickAddNewArr, 'add circle') }
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            <Segment style={{ paddingLeft: 0, paddingRight: 0 }}>
                                { this.renderNpCmd() }
                            </Segment>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            { this.renderBtn('visualize', this.onClickVisualize, 'video play') }
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={{ textAlign: 'left' }}>
                        <Grid.Column width={16}>
                            {this.renderSVG()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

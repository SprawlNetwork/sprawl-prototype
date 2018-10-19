import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { connectedToNode, nodeAddress } from "../selectors";

class NodeInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { newAddress: props.nodeAddress };
  }

  onSubmit = e => {
    e.preventDefault();
    this.props.onConnect(this.state.newAddress);
  };

  onInputChanged = e => {
    const newValue =
      e.target.value !== "" ? e.target.value : this.props.nodeAddress;
    this.setState({ newAddress: newValue });
  };

  render() {
    return (
      <div className="container mt-4">
        <form
          className="mt-3"
          onSubmit={this.onSubmit}
          ref={i => (this.form = i)}
        >
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">Node address</span>
            </div>
            <input
              type="text"
              className="form-control mr-2"
              value={this.state.newAddress}
              onChange={this.onInputChanged}
            />
            <button
              disabled={
                this.state.newAddress === this.props.nodeAddress &&
                this.props.connectedToNode
              }
              className="btn btn-primary"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state, { onConnect }) => ({
  onConnect,
  nodeAddress: nodeAddress(state),
  connectedToNode: connectedToNode(state)
});

export default connect(mapStateToProps)(NodeInfo);

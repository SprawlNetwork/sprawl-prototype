import React, { PureComponent } from "react";
import { connect } from "react-redux";

class NodeInfo extends PureComponent {
  onSubmit = e => {
    e.preventDefault();
    this.props.onConnect(this.addressInput.value);
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
              defaultValue={this.props.nodeAddress}
              ref={i => (this.addressInput = i)}
            />
            <button className="btn btn-primary">Connect</button>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ nodeAddress }, { onConnect }) => ({
  onConnect,
  nodeAddress
});

export default connect(mapStateToProps)(NodeInfo);

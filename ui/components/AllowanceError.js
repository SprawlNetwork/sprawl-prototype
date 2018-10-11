import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";

class AllowanceError extends Component {
  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.dismiss}>
        <ModalHeader toggle={this.props.dismiss}>
          Error setting allowance
        </ModalHeader>
        <ModalBody>
          An error occurred while setting the allowance.
          <br />
          Please check your ETH balance and connection and try again.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.props.dismiss}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default connect()(AllowanceError);

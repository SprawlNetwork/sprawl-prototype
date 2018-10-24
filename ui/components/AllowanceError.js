import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export function AllowanceError(props) {
  return (
    <Modal isOpen={props.isOpen} toggle={props.dismiss}>
      <ModalHeader toggle={props.dismiss}>Error setting allowance</ModalHeader>
      <ModalBody>
        An error occurred while setting the allowance.
        <br />
        Please check your ETH balance and connection and try again.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={props.dismiss}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

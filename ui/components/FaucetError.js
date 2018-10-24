import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export function FaucetError(props) {
  return (
    <Modal isOpen={props.isOpen} toggle={props.dismiss}>
      <ModalHeader toggle={props.dismiss}>Error calling faucet</ModalHeader>
      <ModalBody>
        An error occurred while calling the faucet
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

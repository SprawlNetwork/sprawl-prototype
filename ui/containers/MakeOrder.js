import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { makeOrderFailureDismiss } from "../actions/index";

class MakeOrder extends PureComponent {
  onSubmit = e => {
    e.preventDefault();

    this.props.onSubmit({
      wethAmount: +this.wethInput.value,
      zrxAmount: +this.zrxInput.value,
      isBuy: this.actionSelect.value === "buy"
    });

    this.form.reset();
  };

  onDismiss = () => {
    this.props.dispatch(makeOrderFailureDismiss());
  };

  render() {
    let { error, disabled } = this.props;
    return (
      <div className="container mt-5 mb-4">
        <div className="card w-50 m-auto">
          <div className="card-body">
            <h5 className="card-title">Maker order</h5>

            {error && (
              <div className="mt-3 alert alert-danger" role="alert">
                Error making order
                <button
                  type="button"
                  className="close"
                  data-dismiss="alert"
                  aria-label="Close"
                  onClick={this.onDismiss}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            <form
              className="mt-3"
              onSubmit={this.onSubmit}
              ref={i => (this.form = i)}
            >
              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">WETH amount</span>
                  </div>
                  <input
                    type="number"
                    ref={i => (this.wethInput = i)}
                    required={true}
                    className="form-control"
                    placeholder="0.1"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">ZRX amount</span>
                  </div>
                  <input
                    type="number"
                    ref={i => (this.zrxInput = i)}
                    required={true}
                    className="form-control"
                    placeholder="0.1"
                  />
                </div>
              </div>

              <div className="form-group">
                <select
                  className="form-control"
                  ref={i => (this.actionSelect = i)}
                >
                  <option value={"buy"}>Buy ZRX</option>
                  <option value={"sell"}>Sell ZRX</option>
                </select>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={disabled}
                >
                  Make
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (
  { localAccount, connectionError, makeOrderError },
  { onSubmit }
) => ({
  disabled: localAccount.address === undefined || connectionError,
  error: makeOrderError,
  onSubmit
});

export default connect(mapStateToProps)(MakeOrder);

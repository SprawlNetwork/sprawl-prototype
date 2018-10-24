import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { makeOrderFailureDismiss, makeOrderFailure } from "../actions/index";
import { BigNumber } from "@0xproject/utils";

class MakeOrderComponent extends PureComponent {
  onSubmit = e => {
    e.preventDefault();

    const makerToken = this.props.tokens[this.makerAssetSelect.value];
    const takerToken = this.props.tokens[this.takerAssetSelect.value];

    const makerAssetAmount = new BigNumber(this.makerAssetAmount.value).mul(
      new BigNumber(10).pow(makerToken.decimals)
    );

    const takerAssetAmount = new BigNumber(this.takerAssetAmount.value).mul(
      new BigNumber(10).pow(takerToken.decimals)
    );

    if (
      makerToken.balance === undefined ||
      makerToken.balance.lt(makerAssetAmount)
    ) {
      this.props.dispatch(makeOrderFailure(new Error("Not enough balance.")));
      return;
    }

    if (
      makerToken.allowance === undefined ||
      makerToken.allowance.lt(makerAssetAmount)
    ) {
      this.props.dispatch(makeOrderFailure(new Error("Not enough allowance.")));
      return;
    }

    this.props.onSubmit({
      makerAssetAddress: makerToken.address,
      makerAssetAmount,
      takerAssetAddress: takerToken.address,
      takerAssetAmount
    });

    this.form.reset();
  };

  onDismiss = () => {
    this.props.dispatch(makeOrderFailureDismiss());
  };

  _displayableError(error) {
    const str = error.toString();
    const i = str.indexOf(":");

    return i !== -1 ? str.substring(i + 2, i + 32) : str.substring(0, 30);
  }

  render() {
    let { error, disabled, tokens } = this.props;

    if (Object.keys(tokens).length === 0) {
      return null;
    }

    return (
      <div className="container mt-5 mb-4">
        <div className="card w-50 m-auto">
          <div className="card-body">
            <h5 className="card-title">Maker order</h5>

            {error && (
              <div
                className="mt-3 alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                Error making order: {this._displayableError(error)}
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
                    <span className="input-group-text">Maker asset</span>
                  </div>
                  <select
                    className="form-control"
                    ref={i => (this.makerAssetSelect = i)}
                  >
                    {Object.values(tokens).map(t => (
                      <option value={t.address} key={t.address}>
                        {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Maker asset amount</span>
                  </div>
                  <input
                    type="number"
                    ref={i => (this.makerAssetAmount = i)}
                    required={true}
                    className="form-control"
                    placeholder="0.1"
                    step="0.00000000001"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Taker asset</span>
                  </div>
                  <select
                    className="form-control"
                    ref={i => (this.takerAssetSelect = i)}
                  >
                    {Object.values(tokens).map(t => (
                      <option value={t.address} key={t.address}>
                        {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Taker asset amount</span>
                  </div>
                  <input
                    type="number"
                    ref={i => (this.takerAssetAmount = i)}
                    required={true}
                    className="form-control"
                    placeholder="0.1"
                    step="0.00000000001"
                  />
                </div>
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
  { localAccount, nodeConnection, makeOrderError, tokens },
  { onSubmit }
) => ({
  disabled:
    localAccount.address === undefined ||
    nodeConnection.error ||
    !nodeConnection.connected,
  error: makeOrderError,
  onSubmit,
  tokens
});

export const MakeOrder = connect(mapStateToProps)(MakeOrderComponent);

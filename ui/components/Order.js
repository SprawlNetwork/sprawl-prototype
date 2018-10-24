import React, { PureComponent } from "react";
import * as datefns from "date-fns";
import { Amount } from "./Amount";

export class Order extends PureComponent {
  render() {
    let { order, number, makerToken, takerToken } = this.props;

    return (
      <tr>
        <th scope="row">{number}</th>
        <td>{this._shortHash(order.id)}</td>
        <td>{this._displayableAddress(order.signedOrder.makerAddress)}</td>
        <td>
          {order.signedTakeOrderTransaction !== undefined &&
            this._displayableAddress(
              order.signedTakeOrderTransaction.takerAddress
            )}
        </td>
        <td>
          <Amount
            units={order.signedOrder.makerAssetAmount}
            symbol={makerToken.symbol}
          />
        </td>
        <td>
          <Amount
            units={order.signedOrder.takerAssetAmount}
            symbol={takerToken.symbol}
          />
        </td>
        <td className="order-date">{this._renderDate(order.receptionDate)}</td>
        <td className="order-date">
          {this._renderDate(this._getExpirationDate())}
        </td>
        <td>{this._renderTakeExpiredOrElse()}</td>
      </tr>
    );
  }

  _renderTakeExpiredOrElse() {
    const { order, localAccount, takerToken } = this.props;
    const localAddress = localAccount.address;

    if (order.filling) {
      if (order.signedTakeOrderTransaction.takerAddress === localAddress) {
        return "Taking...";
      }

      return "Taking by other...";
    }

    if (order.fillingError) {
      if (order.signedTakeOrderTransaction.takerAddress === localAddress) {
        return "Error taking";
      }

      return "Error taking by other";
    }

    if (order.filled) {
      if (order.signedTakeOrderTransaction.takerAddress === localAddress) {
        return "Taken";
      }

      return "Taken by other";
    }

    if (order.localTaker) {
      if (order.localTaker === localAddress) {
        return "Taking...";
      }

      return "Taking by other...";
    }

    if (this._isExpired()) {
      return "Expired";
    }

    if (
      takerToken.balance === undefined ||
      takerToken.allowance === undefined
    ) {
      return "";
    }

    if (order.signedOrder.takerAssetAmount.gt(takerToken.balance)) {
      return <b>Not enough balance</b>;
    }

    if (order.signedOrder.takerAssetAmount.gt(takerToken.allowance)) {
      return <b>Not enough allowance</b>;
    }

    return (
      <button
        type="submit"
        className="btn btn-sm btn-primary"
        onClick={() => this.props.onTakeOrder(order)}
      >
        Take
      </button>
    );
  }

  _isExpired() {
    return datefns.isBefore(this._getExpirationDate(), new Date());
  }

  _shortHash(addr) {
    if (addr === undefined) {
      return "";
    }

    return addr.substr(0, 6) + "..." + addr.substr(-4);
  }

  _displayableAddress(addr) {
    if (addr === this.props.localAccount.address) {
      return <b>{this._shortHash(addr)}</b>;
    }

    return this._shortHash(addr);
  }

  _renderDate(date) {
    return (
      <>
        {datefns.format(date, "MMM D YYYY")}
        <br />
        {datefns.format(date, "HH:mm:ss")}
      </>
    );
  }

  _getExpirationDate() {
    const { order } = this.props;
    const seconds = order.signedOrder.expirationTimeSeconds.toNumber();
    return new Date(seconds * 1000);
  }
}

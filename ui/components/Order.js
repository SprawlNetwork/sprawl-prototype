import React, { PureComponent } from "react";
import * as datefns from "date-fns";

export default class Order extends PureComponent {
  render() {
    let { order, number } = this.props;
    return (
      <tr>
        <th scope="row">{number}</th>
        <td>{this._displayableAddress(order.maker)}</td>
        <td>{this._displayableAddress(order.taker)}</td>
        <td>{order.weth}</td>
        <td>{order.zrx}</td>
        <td>{order.buysZrx ? "✔" : ""}</td>
        <td>{order.receptionDate.toLocaleString()}</td>
        <td>{order.expirationDate.toLocaleString()}</td>
        <td>
          {this._isTakeable() ? (
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              onClick={() => this.props.onTakeOrder(order)}
            >
              Take
            </button>
          ) : this._isTaken() ? (
            "Taken"
          ) : (
            "Expired"
          )}
        </td>
      </tr>
    );
  }

  _isExpired() {
    return datefns.isBefore(this.props.order.expirationDate, new Date());
  }

  _isTaken() {
    return this.props.order.taker !== undefined;
  }

  _isTakeable() {
    return !this._isExpired() && !this._isTaken();
  }

  _shortAddress(addr) {
    if (addr === undefined) {
      return "";
    }

    return addr.substr(0, 6) + "..." + addr.substr(-4);
  }

  _displayableAddress(addr) {
    if (addr === this.props.localAddress) {
      return <b>{this._shortAddress(addr)}</b>;
    }

    return this._shortAddress(addr);
  }
}

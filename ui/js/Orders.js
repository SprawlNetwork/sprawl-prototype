import React, { Component } from "react";
import * as datefns from "date-fns";

class Order extends Component {
  render() {
    let { order } = this.props;
    return (
      <tr>
        <th scope="row">{order.id}</th>
        <td>{this._shrotenAddress(order.maker)}</td>
        <td>{this._shrotenAddress(order.taker)}</td>
        <td>{order.weth}</td>
        <td>{order.zrx}</td>
        <td>{order.receptionDate.toLocaleString()}</td>
        <td>{order.expirationDate.toLocaleString()}</td>
        <td>
          {this._isTakable() ? (
            <button type="submit" className="btn btn-sm btn-primary">
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

  _isTakable() {
    return !this._isExpired() && !this._isTaken();
  }

  _shrotenAddress(addr) {
    if (addr === undefined) {
      return "";
    }

    return addr.substr(0, 6) + "..." + addr.substr(-4);
  }
}

export function Orders({ orders }) {
  return (
    <div className="container mt-4">
      <h2>Orders</h2>

      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Maker</th>
            <th scope="col">Taker</th>
            <th scope="col">WETH</th>
            <th scope="col">ZRX</th>
            <th scope="col">Receiption date</th>
            <th scope="col">Expiration date</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <Order order={o} key={o.id} />
          ))}

          {/*<tr>*/}
          {/*<th scope="row">2</th>*/}
          {/*<td>0xa6db...67b6</td>*/}
          {/*<td>0xa6db...67b6</td>*/}
          {/*<td>0.123123</td>*/}
          {/*<td>8.123123</td>*/}
          {/*<td>9/19/2018, 2:45:50 PM</td>*/}
          {/*<td>9/19/2018, 2:45:50 PM</td>*/}
          {/*<td />*/}
          {/*</tr>*/}
        </tbody>
      </table>
    </div>
  );
}

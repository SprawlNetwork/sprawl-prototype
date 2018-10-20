import React from "react";
import * as datefns from "date-fns";
import { connect } from "react-redux";
import Order from "../components/Order";

function Orders(props) {
  let { orders, localAccount, onTakeOrder } = props;

  const sortedOrders = Object.values(orders).sort((o1, o2) =>
    datefns.compareAsc(o1.receptionDate, o2.receptionDate)
  );

  if (sortedOrders.length === 0) {
    return (
      <div className="container mt-4">
        <h2>Orders</h2>
        <div>No orders to show</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Orders</h2>

      <table className="table table-hover table-striped mt-4 orders">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Order ID</th>
            <th scope="col">Maker</th>
            <th scope="col">Taker</th>
            <th scope="col">Sell</th>
            <th scope="col">Buy</th>
            <th scope="col">Reception</th>
            <th scope="col">Expiration</th>
            <th scope="col" className="order-actions-column"/>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((o, i) => (
            <Order
              order={o}
              key={i}
              number={i}
              localAccount={localAccount}
              onTakeOrder={onTakeOrder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mapStateToProps = ({ localAccount, orders }, { onTakeOrder }) => ({
  localAccount,
  orders,
  onTakeOrder
});

export default connect(mapStateToProps)(Orders);

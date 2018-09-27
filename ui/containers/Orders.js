import React from "react";
import * as datefns from "date-fns";
import { connect } from "react-redux";
import Order from "../components/Order";

function Orders(props) {
  let { orders, localAddress, onTakeOrder } = props;

  const sortedOrders = Object.values(orders).sort((o1, o2) =>
    datefns.compareAsc(o1.receptionDate, o2.receptionDate)
  );

  return (
    <div className="container mt-4">
      <h2>Orders</h2>

      <table className="table table-hover table-striped mt-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Maker</th>
            <th scope="col">Taker</th>
            <th scope="col">WETH</th>
            <th scope="col">ZRX</th>
            <th scope="col">Buy ZRX?</th>
            <th scope="col">Receiption date</th>
            <th scope="col">Expiration date</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((o, i) => (
            <Order
              order={o}
              key={i}
              number={i}
              localAddress={localAddress}
              onTakeOrder={onTakeOrder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mapStateToProps = (
  { localAccount: { address: localAddress }, orders },
  { onTakeOrder }
) => ({
  localAddress,
  orders,
  onTakeOrder
});

export default connect(mapStateToProps)(Orders);

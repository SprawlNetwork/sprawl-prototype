import React from "react";

export function MakeOrder() {
  return (
    <div className="container mt-5 mb-4">
      <div className="card w-50 m-auto">
        <div className="card-body">
          <h5 className="card-title">Maker order</h5>
          <form className="mt-3">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">WETH amount</span>
                </div>
                <input type="text" className="form-control" placeholder="0.1" />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">ZRX amount</span>
                </div>
                <input type="text" className="form-control" placeholder="0.1" />
              </div>
            </div>

            <div className="form-group">
              <select className="form-control">
                <option>Buy ZRX</option>
                <option>Sell ZRX</option>
              </select>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary btn-lg">
                Make
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

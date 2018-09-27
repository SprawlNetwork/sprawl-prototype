import React from "react";

export default function GlobalError({ msg }) {
  return (
    <div className="globalError">
      <div className="alert alert-danger" role="alert">
        {msg}
      </div>
    </div>
  );
}

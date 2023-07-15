import React from "react";
import { ImLocation2 } from "react-icons/im";

const DisableOrginForm = ({ address, editable }) => {
  return (
    <div>
      <div className="flex justify-between px-2 my-3  mb-5">
        <p className="text-zinc-500 flex items-center text-sm">
          <ImLocation2 className="text-orange-500 text-lg" />
          Destination
        </p>
        <p className="text-zinc-500 cursor-pointer text-sm" onClick={editable}>
          Edit
        </p>
      </div>
      <p className="text-gray-500 font-medium px-3">{address}</p>
    </div>
  );
};

export default DisableOrginForm;

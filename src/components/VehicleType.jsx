import { useState } from "react";

const VehicleType = ({ cycling, riding, walking, message }) => {
  const [selectedDiv, setSelectedDiv] = useState();
  if (message) return <p className="text-red-500">{message}</p>;
  const roundFunc = (num) => {
    return Math.round(num);
  };
  const handleDivClick = (divId) => {
    setSelectedDiv(divId);
  };

  return (
    <div className="text-gray-800">
      <div class="grid grid-cols-3 gap-4">
        <div
          className={`flex justify-center cursor-pointer items-center flex-col p-1 ${
            selectedDiv === "ride" && riding ? "bg-blue-500" : "bg-gray-100"
          } ${!riding ? "bg-gray-300 cursor-default" : null}`}
          id="ride"
          onClick={() => handleDivClick("ride")}
        >
          <img src="/motor.png" className="w-10 object-contain h-10 p-1" />
          <p>{riding?.price} $</p>
          {riding?.duration && <p>{roundFunc(riding?.duration)} min</p>}
        </div>
        <div
          className={`flex justify-center cursor-pointer items-center flex-col p-1 ${
            selectedDiv === "cycle" && cycling ? "bg-blue-500" : "bg-gray-100"
          } ${!cycling ? "bg-gray-300 cursor-default" : null}`}
          id="cycle"
          onClick={() => handleDivClick("cycle")}
        >
          <img src="/bike.png" className="w-10 object-contain h-10 p-1" />
          <p>{cycling?.price}$</p>
          {cycling?.duration && <p>{roundFunc(cycling?.duration)}min</p>}
        </div>
        <div
          className={`flex justify-center cursor-pointer items-center flex-col p-1 ${
            selectedDiv === "walk" && walking ? "bg-blue-500" : "bg-gray-100"
          } ${!walking ? "bg-gray-300 cursor-default" : null}`}
          id="walk"
          onClick={() => handleDivClick("walk")}
        >
          <img src="/walk2.png" className="w-10 object-contain h-10 p-1" />
          <p>{walking?.price} $</p>
          {walking?.duration && <p>{roundFunc(walking?.duration)} min</p>}
        </div>
      </div>
    </div>
  );
};

export default VehicleType;

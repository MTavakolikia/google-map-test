const ParcelsType = ({
  id,
  parcel_description,
  parcel_img_url,
  parcel_type,
  parcel_min_weight,
  parcel_max_weight,
  handelSelectedParcel,
  selectedParcel,
}) => {
  const handleSelectParcel = (id) => {
    handelSelectedParcel(id);
  };
  const bgslected = selectedParcel
    ? "bg-blue-500 hover:bg-blue-500"
    : "bg-gray-100";
  return (
    <div
      onClick={() => handleSelectParcel(id)}
      className={`flex items-center justify-between  border-gray-300  hover:bg-gray-200 text-gray-600 cursor-pointer py-2 px-3 border-b-2 ${bgslected}`}
    >
      <div className="flex items-center justify-start">
        <img
          src={parcel_img_url}
          alt={parcel_type}
          className="w-10 object-contain h-10 p-1 bg-gray-300"
        />
        <p className="mx-2 text-sm">{parcel_type}</p>
      </div>
      <div className="flex flex-col justify-center items-center text-xs mx-5">
        <span>{` ${parcel_min_weight}-${parcel_max_weight}kg max`}</span>
        <span>{parcel_description}</span>
      </div>
    </div>
  );
};

export default ParcelsType;

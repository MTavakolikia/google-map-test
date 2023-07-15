import { ImLocation2 } from "react-icons/im";

const LocationForm = () => {
  return (
    <div className="p-4 bg-white">
      <div className=" mx-2 justify-center">
        <div className="flex justify-between px-2 my-3">
          <p className="text-zinc-500 flex items-center text-sm">
            <ImLocation2 className="text-blue-800 text-lg" />
            Origin
          </p>
          <p
            className="text-zinc-500 cursor-pointer text-sm"
            onClick={clearOrgin}
          >
            Clear
          </p>
        </div>
        <div className="relative h-11 w-full min-w-[200px] mb-2">
          <input
            className="peer h-full w-full border-b-2 px-2 bg-gray-100 text-slate-800 pt-4 pb-1.5 text-sm outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 focus:bg-gray-50 disabled:bg-blue-gray-50"
            placeholder=""
            ref={originRef}
          />
          <span
            onClick={clearOrgin}
            className="absolute right-4 top-3 hover:bg-slate-500 pt-0 px-1 pb-1 transition-all hover:text-gray-50 text-gray-400 cursor-pointer bg-white rounded-full inline-block leading-none"
          >
            ×
          </span>
          <label className="after:content[' '] pointer-events-none absolute text-zinc-500 left-2 -top-1.5 flex h-full w-full select-none text-[11px]  leading-tight  transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-3 after:border-zinc-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-zinc-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
            Address
          </label>
        </div>
        <div className="flex mt-5 justify-between">
          <button
            className="bg-transparent mx-1 hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500  rounded"
            type="submit"
          >
            Choose from Favourites
          </button>
          <button
            disabled={true}
            className="bg-transparent hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500 grow mx-1  rounded disabled:text-gray-400 disabled:border-gray-400"
            type="submit"
          >
            Confirm Origin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;

import React, { useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";

const SignupSchema = Yup.object().shape({
  address: Yup.string().required("Required"),
  phoneNumber: Yup.number()
    .min(12, "Phone Number Must Be 12 Number")
    .max(12, "Phone Number Must Be 12 Number")
    .required("Required"),
  userName: Yup.string().required("Required"),
});

const TestForm = () => {
  const originRef = useRef();
  const sourceAutocomplete = new google.maps.places.Autocomplete(
    originRef.current,
    {
      fields: ["address_components", "geometry", "name"],
      types: ["address"],
    }
  );
  sourceAutocomplete.addListener("place_changed", () => {
    let place = sourceAutocomplete.getPlace();
    console.log(place);
    //setDirectionsResponse(place)
    if (!place.geometry) {
      alert("please select an address from suggested list");
    } else {
      originRef.current.value = place.name;
      setCenter(place.geometry.location);
      setIsMark(true);
    }
  });
  return (
    <div>
      <h1>Signup</h1>
      <Formik
        initialValues={{
          address: "",
          moreDetail: "",
          phoneNumber: "",
          userName: "",
        }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          // same shape as initial values
          console.log(values);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="relative h-11 w-full min-w-[200px] mb-2">
              <input
                type="text"
                name="address"
                onChange={handleChange}
                onBlur={handleBlur}
                className="peer h-full w-full border-b-2 px-2 bg-gray-100 text-slate-800 pt-4 pb-1.5 text-sm outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 focus:bg-gray-50 disabled:bg-blue-gray-50"
              />
              <span className="absolute right-4 top-3 hover:bg-slate-500 pt-0 px-1 pb-1 transition-all hover:text-gray-50 text-gray-400 cursor-pointer bg-white rounded-full inline-block leading-none">
                ×
              </span>
              <label className="after:content[' '] pointer-events-none absolute text-zinc-500 left-2 -top-1.5 flex h-full w-full select-none text-[11px]  leading-tight  transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-3 after:border-zinc-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-zinc-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                Address
              </label>
              {errors.address && touched.address}
            </div>
            <input
              type="text"
              name="moreDetail"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              className="peer h-full w-full border-b-2 px-2 bg-gray-100 text-slate-800 pt-4 pb-1.5 text-sm outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 focus:bg-gray-50 disabled:bg-blue-gray-50"
            />
            <input
              type="number"
              name="phoneNumber"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              className="peer h-full w-full border-b-2 px-2 bg-gray-100 text-slate-800 pt-4 pb-1.5 text-sm outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 focus:bg-gray-50 disabled:bg-blue-gray-50"
            />
            {errors.phoneNumber && touched.phoneNumber}
            <input
              type="text"
              name="userName"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              className="peer h-full w-full border-b-2 px-2 bg-gray-100 text-slate-800 pt-4 pb-1.5 text-sm outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 focus:bg-gray-50 disabled:bg-blue-gray-50"
            />
            {errors.userName && touched.userName}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default TestForm;

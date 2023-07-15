
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { collection, getDocs } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'
import { useFormik } from 'formik';
import * as Yup from "yup";

import ParcelsType from '@/components/ParcelsType';
import VehicleType from '@/components/VehicleType';
import Loader from '@/components/Loader';
import DisableOrginForm from '@/components/DisableOrginForm';

import { ImLocation2 } from "react-icons/im";


export default function Home() {
  const [center, setCenter] = useState({ lat: 48.8584, lng: 2.2945 })
  const [map, setMap] = useState((null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [originCoordinate, setOriginCoordinate] = useState()
  const [destinitionCoordinate, setDestinitionCoordinate] = useState()
  const [isMark, setIsMark] = useState(false);
  const [parcelData, setParcelData] = useState(null);
  const [parcelId, setParcelId] = useState();
  const [parcelConfirmed, setParcelConfirmed] = useState();
  const [isParcelLoaded, setIsParcelLoaded] = useState(false);
  const [isParcelsConfirmed, setIsParcelConfirmed] = useState(false);
  const [isTransportLoaded, setIsTransportLoaded] = useState(false);
  const [transportResult, setTransportResult] = useState(null);
  const [approvalCheck, setApprovalCheck] = useState(true);
  const [originFormData, setOriginFormData] = useState({ editable: false });
  const [destinationFormData, setDestinationFormData] = useState({ editable: true });

  const originRef = useRef()
  const destiantionRef = useRef()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyASGf3xaQKOEsMZaYET96y4yh0GI9oI4pk",
    libraries: ['places'],
  })

  const handelSelectedParcelId = (id) => {
    setParcelId(id)
    const filter = parcelData.filter(q => q.id == id)
    setParcelConfirmed(filter);
    console.log(filter);
  }

  const handleParcelConfirm = () => {
    setIsTransportLoaded(true);
    setIsParcelConfirmed(true);
    const { vehicle_type, parcel_type, parcel_description, parcel_min_weight, parcel_max_weight } = parcelConfirmed[0];
    const priceParameter = {
      origin: {
        lat: originCoordinate.lat(),
        lng: originCoordinate.lng()
      },
      destination: {
        lat: destinitionCoordinate.lat(),
        lng: destinitionCoordinate.lng()
      },

      vehicle_type: {
        walking: vehicle_type.walking,
        driving: vehicle_type.driving,
        bicycling: vehicle_type.bicycling,
      },
      parcel_type: parcel_type,
      parcel_description: parcel_description,
      parcel_min_weight: parcel_min_weight,
      parcel_max_weight: parcel_max_weight,
    }

    const getPrice = httpsCallable(functions, 'pricing');
    getPrice(priceParameter)
      .then((result) => {
        setTransportResult(result.data);
      })
      .catch((error) => {
        console.log("PriceError:", error);
      });
  }

  const handleParcelType = () => {
    const getParcelData = async () => {
      try {
        const storage = getStorage();
        const dataCollectionRef = collection(db, "bearerParcels");
        const dataList = await getDocs(dataCollectionRef);
        let filteredData = dataList.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        for (let i = 0; i < filteredData.length; i++) {
          const item = filteredData[i];
          if (item.parcel_img_url) {
            const starsRef = ref(storage, item.parcel_img_url);
            const url = await getDownloadURL(starsRef);
            filteredData[i].parcel_img_url = url;
          }
        }
        setParcelData(filteredData);
      } catch (error) {
        console.log(error);
      }
    }
    getParcelData();
  }

  function clearOrgin() {
    originRef.current.value = ''
    setDirectionsResponse(null)
    setIsMark(true)
    originForm.resetForm();
    setOriginFormData("");
  }

  function clearDestination() {
    destiantionRef.current.value = ''
    setDirectionsResponse(null)
    setIsMark(true)
    setDestinationFormData("");
  }

  function clearRoute() {
    setDirectionsResponse(null)
    clearOrgin();
    clearDestination();
  }

  const originFormSchema = Yup.object().shape({
    address: Yup.string().required("Required"),
    phoneNumber: Yup.number()
      .min(10, "10 Digits (Begining with a 0)")
      .required("Required"),
    senderName: Yup.string().required("Required").min(2, "Minimum: 2 letters (English Only)"),
  });

  const originForm = useFormik({
    initialValues: {
      address: "",
      moreDetail: "",
      phoneNumber: "",
      senderName: "",
    },
    validationSchema: originFormSchema,
    onSubmit: function (values) {
      setOriginFormData({ ...values, address: originRef.current.value, editable: true });
      setDestinationFormData({ ...destinationFormData, editable: false })
    }
  })


  const destinationFormSchema = Yup.object().shape({
    address: Yup.string().required("Required"),
    phoneNumber: Yup.number()
      .min(10, "10 Digits (Begining with a 0)")
      .required("Required"),
    senderName: Yup.string().required("Required").min(2, "Minimum: 2 letters (English Only)"),
  });

  const destinationForm = useFormik({
    initialValues: {
      address: "",
      moreDetail: "",
      phoneNumber: "",
      senderName: "",
    },
    validationSchema: destinationFormSchema,
    onSubmit: function (values) {
      setDestinationFormData({ ...values, address: destiantionRef.current.value, editable: true });
      setIsParcelLoaded(true);
      handleParcelType();

    }
  })

  if (!isLoaded) {
    return <Loader />
  }

  const sourceAutocomplete = new google.maps.places.Autocomplete(originRef.current, {
    fields: ["address_components", "geometry", "name"],
    types: ["address"],
  });
  sourceAutocomplete.addListener('place_changed', () => {
    let place = sourceAutocomplete.getPlace();
    if (!place.geometry) {
      alert("please select an address from suggested list")
    } else {
      //originRef.current.value = place.name;
      setCenter(place.geometry.location);
      setIsMark(true);
    }
  })

  const destinationAutocomplete = new google.maps.places.Autocomplete(destiantionRef.current, {
    fields: ["address_components", "geometry", "name"],
    types: ["address"],
  });
  destinationAutocomplete.addListener('place_changed', async () => {
    console.log(originRef.current.value);
    if (originRef.current.value === '') {
      alert("originref is  empty dude")
      return
    }
    try {
      setIsMark(false);
      const directionsService = new google.maps.DirectionsService()
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destiantionRef.current.value,

        travelMode: google.maps.TravelMode.DRIVING,
      });
      console.log("resultssssssssssss:", results);
      setDirectionsResponse(results)
      // setDistance(results.routes[0].legs[0].distance.text)
      // setDuration(results.routes[0].legs[0].duration.text)
      setOriginCoordinate(results.routes[0].legs[0].start_location);
      setDestinitionCoordinate(results.routes[0].legs[0].end_location);
    } catch (error) {
      alert(error.message)
    }
  })

  // console.log("data", parcelData);

  return (
    <main className='relative flex-col items-center h-screen w-screen'>
      <div className="grid grid-cols-6 h-full w-full">
        <div className="col-span-2 bg-gray-200 pr-3 shadow-xl">

          {/* Origin Form */}
          <div className='p-4 bg-white'>
            <div className=' mx-2 justify-center'>

              <div className='flex justify-between px-2 my-3  mb-5'>
                <p className='text-zinc-500 flex items-center text-sm'>
                  <ImLocation2 className='text-blue-800 text-lg' />
                  Origin</p>
                <p className='text-zinc-500 cursor-pointer text-sm'
                  onClick={clearOrgin}
                >Clear</p>
              </div>

              <form onSubmit={originForm.handleSubmit}>
                <div className="relative h-11 w-full min-w-[200px] mb-5">
                  <input
                    type="text"
                    name="address"
                    onChange={originForm.handleChange}
                    onBlur={originForm.handleBlur}
                    placeholder=" "
                    ref={originRef}
                    value={originFormData ? originFormData.address : originForm.values.address}
                    className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                  /><span onClick={clearOrgin} className='absolute right-4 top-3 hover:bg-slate-500 pt-0 px-1 pb-1 transition-all hover:text-gray-50 text-gray-400 cursor-pointer bg-white rounded-full inline-block leading-none'>×</span>
                  <label htmlFor='address' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                    Address
                  </label>
                  {originForm.touched.address && originForm.errors.address && (
                    <p className='text-red-400 block'>{originForm.errors.address}</p>
                  )}
                </div>
                <div className="relative h-11 w-full min-w-[200px] mb-4">
                  <input
                    type="text"
                    name="moreDetail"
                    onChange={originForm.handleChange}
                    onBlur={originForm.handleBlur}
                    value={originForm.values.moreDetail}
                    placeholder=" "
                    className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                  />
                  <label htmlFor='moreDetail' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                    More Details / Message for the Rider
                  </label>
                </div>
                <div className='flex'>
                  <div className="relative h-11 w-full min-w-[200px] mb-4 mr-1">
                    <input
                      type="number"
                      name="phoneNumber"
                      onChange={originForm.handleChange}
                      onBlur={originForm.handleBlur}
                      value={originForm.values.phoneNumber}
                      placeholder=" "
                      className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                    />
                    <label htmlFor='phoneNumber' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                      Phone Number
                    </label>
                    {originForm.touched.phoneNumber && originForm.errors.phoneNumber && (
                      <span className='text-red-400'>{originForm.errors.phoneNumber}</span>
                    )}
                  </div>
                  <div className="relative h-11 w-full min-w-[200px] mb-4 ml-1">
                    <input
                      type="text"
                      name="senderName"
                      onChange={originForm.handleChange}
                      onBlur={originForm.handleBlur}
                      value={originForm.values.senderName}
                      placeholder=" "
                      className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                    />
                    <label htmlFor='senderName' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                      Senders Name
                    </label>
                    {originForm.touched.senderName && originForm.errors.senderName && (
                      <span className='text-red-400'>{originForm.errors.senderName}</span>
                    )}
                  </div>
                </div>
                <div className='flex mt-5 justify-between'>
                  <button className='bg-transparent mx-1 hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500  rounded' type='submit'>
                    Choose from Favourites
                  </button>
                  <button type='submit' disabled={!originForm.isValid} className='bg-transparent hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500 grow mx-1  rounded disabled:text-gray-400 disabled:border-gray-400'>
                    Confirm Origin
                  </button>
                </div>
              </form>


            </div>
          </div>

          {/* Destination Form */}
          <div className='p-4 bg-white mt-4'>
            <div className=' mx-2 justify-center'>
              {!destinationFormData.editable ?
                <>
                  <div className='flex justify-between px-2 my-3 mb-5'>
                    <p className='text-zinc-500 flex items-center text-sm'>
                      <ImLocation2 className='text-orange-500 text-lg' />
                      Destination</p>
                    <p className='text-zinc-500 cursor-pointer text-sm'
                      onClick={clearDestination}
                    >Clear</p>
                  </div>

                  <form onSubmit={destinationForm.handleSubmit}>
                    <div className="relative h-11 w-full min-w-[200px] mb-5">
                      <input
                        type="text"
                        name="address"
                        onChange={destinationForm.handleChange}
                        onBlur={destinationForm.handleBlur}
                        placeholder=" "
                        ref={destiantionRef}
                        value={destinationFormData ? destinationFormData.address : destinationForm.values.address}
                        className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                      /><span onClick={clearDestination} className='absolute right-4 top-3 hover:bg-slate-500 pt-0 px-1 pb-1 transition-all hover:text-gray-50 text-gray-400 cursor-pointer bg-white rounded-full inline-block leading-none'>×</span>
                      <label htmlFor='address' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                        Address
                      </label>
                      {destinationForm.touched.address && destinationForm.errors.address && (
                        <p className='text-red-400 block'>{destinationForm.errors.address}</p>
                      )}
                    </div>
                    <div className="relative h-11 w-full min-w-[200px] mb-4">
                      <input
                        type="text"
                        name="moreDetail"
                        onChange={destinationForm.handleChange}
                        onBlur={destinationForm.handleBlur}
                        value={destinationForm.values.moreDetail}
                        placeholder=" "
                        className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                      />
                      <label htmlFor='moreDetail' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                        More Details / Message for the Rider
                      </label>
                    </div>
                    <div className='flex'>
                      <div className="relative h-11 w-full min-w-[200px] mb-4 mr-1">
                        <input
                          type="number"
                          name="phoneNumber"
                          onChange={destinationForm.handleChange}
                          onBlur={destinationForm.handleBlur}
                          value={destinationForm.values.phoneNumber}
                          placeholder=" "
                          className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                        />
                        <label htmlFor='phoneNumber' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                          Phone Number
                        </label>
                        {destinationForm.touched.phoneNumber && destinationForm.errors.phoneNumber && (
                          <span className='text-red-400'>{destinationForm.errors.phoneNumber}</span>
                        )}
                      </div>
                      <div className="relative h-11 w-full min-w-[200px] mb-4 ml-1">
                        <input
                          type="text"
                          name="senderName"
                          onChange={destinationForm.handleChange}
                          onBlur={destinationForm.handleBlur}
                          value={destinationForm.values.senderName}
                          placeholder=" "
                          className="peer h-full w-full border-b-2 text-slate-800 pt-4 pb-1.5 font-normal outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-blue-500 focus:outline-0 disabled:border-0 bg-gray-100 hover:bg-gray-200 disabled:bg-blue-gray-50"
                        />
                        <label htmlFor='senderName' className="after:content[' '] pointer-events-none absolute text-zinc-500 left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-blue-500 after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.25] peer-placeholder-shown:text-blue-gray-500 peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:after:scale-x-100 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                          Recipient Name
                        </label>
                        {destinationForm.touched.senderName && destinationForm.errors.senderName && (
                          <span className='text-red-400'>{destinationForm.errors.senderName}</span>
                        )}
                      </div>
                    </div>

                    <div className='mt-1'>
                      <p className='text-zinc-500 flex items-center text-sm mb-3'>
                        Delivery Approval by:
                      </p>
                      <div className="flex ">
                        <div className="flex items-center mr-4 w-52">
                          <input id="inline-radio" onClick={() => setApprovalCheck(false)} type="radio" value="" name="inline-radio-group" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300dark:ring-offset-gray-800 " />
                          <label htmlFor="inline-radio" className="ml-2 text-sm  text-gray-600">
                            Confirmation Code
                          </label>
                        </div>
                        <div className="flex items-center mr-4">
                          <input id="inline-2-radio" type="radio" onClick={() => setApprovalCheck(false)} value="" name="inline-radio-group" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300dark:ring-offset-gray-800 " />
                          <label htmlFor="inline-2-radio" className="ml-2 text-sm  text-gray-600">
                            Not Needed
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className='flex mt-5 justify-between'>
                      <button className='bg-transparent mx-1 hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500  rounded' type='submit'>
                        Choose from Favourites
                      </button>
                      <button type='submit' disabled={approvalCheck && !destinationForm.isValid} className='bg-transparent hover:bg-blue-50 text-blue-700  py-2 px-4 border border-blue-500 grow mx-1  rounded disabled:text-gray-400 disabled:border-gray-400'>
                        Confirm Destination
                      </button>
                    </div>
                  </form>
                </>
                :
                <DisableOrginForm address={destinationFormData?.address} editable={() => setDestinationFormData({ ...destinationFormData, editable: false })} />
              }
            </div>
          </div>




          {/* Parcel Selection */}
          {isParcelLoaded &&
            <div className='p-4 bg-white mt-4'>
              <div className=' mx-2 '>
                <div className='flex justify-between px-2 my-3  mb-5'>
                  <p className='text-zinc-500 flex items-center text-sm'>
                    Parcels Type</p>
                  {isParcelsConfirmed ? <p className='text-zinc-500 cursor-pointer text-sm'
                    onClick={() => setIsParcelConfirmed(false)}
                  >Edit</p>
                    :
                    <p className='text-zinc-500 cursor-pointer text-sm'
                      onClick={() => setIsParcelLoaded(false)}
                    >Clear</p>
                  }
                </div>
                {parcelData && !isParcelsConfirmed ?
                  <div> {parcelData?.map(item => (
                    <ParcelsType key={item.id} {...item} handelSelectedParcel={handelSelectedParcelId} selectedParcel={parcelId == item.id} />
                  ))}
                    <div className='w-full text-center mt-3'>
                      <button onClick={handleParcelConfirm} className='bg-transparent hover:bg-blue-50 text-blue-700   py-2 px-20 border border-blue-500 mx-auto rounded'>
                        Confirm
                      </button>
                    </div></div>
                  : <>
                    {isParcelsConfirmed ? null : <Loader />}
                  </>
                }{isParcelsConfirmed &&
                  <div className="flex items-center justify-start">
                    <img
                      src={parcelConfirmed[0].parcel_img_url}
                      alt={parcelConfirmed[0].parcel_type}
                      className="w-10 object-contain h-10 p-1 "
                    />
                    <p className="mx-2 text-sm text-gray-500">{parcelConfirmed[0].parcel_type}</p>
                  </div>
                }
              </div>
            </div>
          }

          {/* Transport Selection */}
          {isTransportLoaded &&
            <div className='p-4 bg-white mt-4'>
              <div className=' mx-2 justify-center'>
                <div className='flex justify-between px-2 my-3  mb-5'>
                  <p className='text-zinc-500 flex items-center text-sm'>
                    Transport Options</p>
                  <p className='text-zinc-500 cursor-pointer text-sm'
                    onClick={() => { setIsTransportLoaded(false); setTransportResult(""); }}
                  >Clear</p>
                </div>
                {transportResult ?
                  <>
                    <VehicleType {...transportResult} />
                    <div className='w-full text-center mt-3'>
                      <button onClick={() => { alert("your order has been submited") }} className='bg-transparent hover:bg-blue-50 text-blue-700   py-2 px-20 border border-blue-500 mx-auto rounded'>
                        Confirm
                      </button>
                    </div>
                  </>
                  : <Loader />}
              </div>
            </div>
          }

        </div>


        {/* Map Selection */}
        <div className="col-span-4">
          {/* <LoadScript
            googleMapsApiKey="AIzaSyASGf3xaQKOEsMZaYET96y4yh0GI9oI4pk"
            libraries={'places'}
          > */}
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={map => setMap(map)}
          >
            <Marker visible={isMark} position={center} icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} />

            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        </div>
      </div>

    </main >
  )
}

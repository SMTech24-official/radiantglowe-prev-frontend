/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

 
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/authSlice";
import { useGetMeQuery } from "@/redux/api/authApi";


const InitAuth = () => {
  const dispatch = useDispatch();
  const {data} = useGetMeQuery()

  useEffect(() => {

    if (data) {
      try {
        dispatch(
          setUser({
            email: data?.data?.email,
            role: data?.data?.role,
            userId: data?.data?._id,
            image: data?.data?.image,
          })
        );
      } catch (error) {
        // console.error("Invalid token", error);
      }
    }
  }, [dispatch,data]);

  return null;
};

export default InitAuth;

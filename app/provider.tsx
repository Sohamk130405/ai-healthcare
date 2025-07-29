"use client";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import { usePathname, useRouter } from "next/navigation";

export enum Role {
  PATIENT = "patient",
  DOCTOR = "doctor",
}

export type UserDetail = {
  name: string;
  email: string;
  phoneNumber: number;
  isProfileCompleted: boolean;
  role: Role;
};

const Provider = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const { user } = useUser();
  const router = useRouter();
  const path = usePathname();

  const [userDetail, setUserDetail] = useState<UserDetail | undefined>();
  useEffect(() => {
    user && createNewUser();
  }, [user]);
  useEffect(() => {
    if (typeof userDetail === "undefined") return;
    if (
      !user ||
      (path != "/" &&
        userDetail &&
        path != "/register" &&
        !userDetail.isProfileCompleted)
    ) {
      router.replace("/register");
    } else if (
      userDetail &&
      userDetail.isProfileCompleted &&
      path === "/register"
    ) {
      router.replace("/dashboard");
    }
  }, [userDetail, router, path]);

  const createNewUser = async () => {
    const result = await axios.post("/api/users");
    if (result.status === 200) {
      console.log("User created successfully:", result.data);
      setUserDetail(result.data);
    } else {
      console.error("Error creating user:", result.data);
    }
  };
  return (
    <UserDetailContext.Provider
      value={{
        userDetail,
        setUserDetail,
      }}
    >
      {children}
    </UserDetailContext.Provider>
  );
};

export default Provider;

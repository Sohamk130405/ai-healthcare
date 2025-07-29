import { UserDetail } from "@/app/provider";
import { createContext, Dispatch, SetStateAction } from "react";
type UserDetailContextType = {
  userDetail: UserDetail | undefined;
  setUserDetail: Dispatch<SetStateAction<UserDetail | undefined>>;
};
export const UserDetailContext = createContext<UserDetailContextType>(
  {} as UserDetailContextType
);

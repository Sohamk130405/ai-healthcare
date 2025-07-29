import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <div className="container py-8 flex justify-center w-full mx-auto">{children}</div>;
};

export default AuthLayout;

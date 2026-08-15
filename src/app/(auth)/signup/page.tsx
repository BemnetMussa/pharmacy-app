import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign up | leyuMed",
};

/** Public signup is disabled — accounts are invite/seed only. */
export default function SignupPage() {
  redirect("/login");
}

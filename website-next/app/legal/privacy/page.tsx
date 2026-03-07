import { redirect } from "next/navigation";

export default function PrivacyRedirectPage() {
  redirect("/de/legal/privacy");
}

import { redirect } from "next/navigation";

export default function CreateListingRedirect() {
  redirect("/dashboard/create-listing");
}

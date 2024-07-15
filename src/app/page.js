import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } 
    catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex-1 py-20 w-full h-screen flex flex-col gap-20 items-center bg-white">
      
      <Link href={'/login'} className=" w-fit px-60 bg-gray-100 border py-6 shadow rounded">
        LOGIN
      </Link>

      <Link href={'/fact-checker'} className=" w-fit px-60 bg-gray-100 border py-6 shadow rounded">
        FACT CHECKER
      </Link>
      
    </div>
  );
}

import { get_user_data } from '@/utils/data_fetch';

import Navbar from '@/components/Navbar';
import Result_container from "@/app/view/[id]/show_result"

const page = async ()=>{

  const user_data = await get_user_data(); 
  return (
    <>
        <Navbar user_data={user_data} />
        <Result_container user_data={user_data} />
    </>
  );
}
export default page;

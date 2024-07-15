"use server"
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// get model response
export const get_res_db_updates = async ({ formData, new_token_amount, user_id }) => {

    const supabase = createClient();

    let res_data = null;
    let IP = process.env.SERVER_IP;
    try {
        const options = {
            method: 'POST',
            body: formData
        };
        const response = await fetch(`${IP}/api/generate-result`, options);
        res_data = await response.json();

        // DEDUCT COST FROM THE DB
        // console.log("DB ACCESS NEW TOKENS=", new_token_amount)
        const { data, error } = await supabase
            .from('Tokens')
            .update({ "token_amount": new_token_amount })
            .eq('id', user_id)
            .select()

        if(error){
            console.error("ERROR: ",error)
            return {message: "error in updating tokens"}
        }
        // console.log("Tokens Updated: ", data)
    }
    catch (error) {
        if(error.cause !== undefined ){
            if (error.cause.code === 'ECONNREFUSED') {
                return { message: "ML MODEL API NOT AVAILABLE" }
            }
        }
        else{
            console.error(error);
            return { message: error }
        }
        //SERVER ISSUE
        return { message: error.cause.code }
    }

    return res_data

}
// get user data
export const get_user_data = async () => {

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    //IF NO USER LOGIN RETURN UNDEFINED 
    if(user===null){
        return ;
    }
    const user_id = user.id;
    //FETCH TOKENS

    let { data, error } = await supabase
        .from('Tokens')
        .select('token_amount')
        .eq('id', user_id);

    // data =  [ { token_amount: 500 } ]
    if (error) {
        console.error("ERROR IN GETTING USER'S TOKENS: ", error)
    }

    const user_data = { ...user.user_metadata, "id": user_id, tokens: data[0].token_amount }

    return user_data;
}
// logout user
export const user_logout = async () =>{
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if(user===null)
        return;

    await supabase.auth.signOut();
    return redirect("/login");
}
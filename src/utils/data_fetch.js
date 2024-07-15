"use server"
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// get model response
export const db_updates = async ({ new_token_amount, user_id }) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('Tokens')
        .update({ "token_amount": new_token_amount })
        .eq('id', user_id)
        .select()

    if (error) {
        console.error("ERROR: ", error)
        return { error: "error in updating tokens" }
    }
    return null;
}

// get user data
export const get_user_data = async () => {

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    //IF NO USER LOGIN RETURN UNDEFINED 
    if (user === null) {
        return;
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
export const user_logout = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user === null)
        return;

    await supabase.auth.signOut();
    return redirect("/login");
}
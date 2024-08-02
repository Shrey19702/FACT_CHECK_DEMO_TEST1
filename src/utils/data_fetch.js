"use server"
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// get model response
export const db_updates = async ({ new_token_amount, user_id }) => {

    const supabase = createClient();

    //save report
    // const { data: insertedReports, error: insertError } = await supabase
    //     .from('reports') // Ensure the table name is correct
    //     .insert([{ user_id: user_id, data: res_data, file_link: "", name: filename }])
    //     .select(); //to get the inserted row
    // if (insertError) {
    //     console.error("ERROR: ", insertError)
    //     return { error: "error in creating report" };
    // }

    // const report_id = insertedReports[0].id;

    // Extract the file from the FormData object
    // let file;

    // if (JSON.parse(formData.get('uploadType')) === "video") {
    //     file = formData.get('video');
    // }
    // else if (JSON.parse(formData.get('uploadType')) === "audio") {
    //     file = formData.get('audio');
    // }
    // else {
    //     console.error("No file found in FormData");
    //     return { error: "No file found in FormData" };
    // }

    //upload file
    // const file_path = `${user_id}/${report_id}`;
    // const { data: upload_data, error: upload_error } = await supabase.storage
    //     .from(process.env.NEXT_PUBLIC_BUCKET_NAME)
    //     .upload(file_path, file);

    // if (upload_error) {
    //     console.error("ERROR: ", upload_error)
    //     return { error: "error in upload files" }
    // }


    // console.log("Upload data:", upload_data);

    // Update the report with the file link
    // const file_link = upload_data.path;
    // const { data: updateData, error: updateError } = await supabase
    //     .from('reports')
    //     .update({ file_link: file_link })
    //     .eq('id', report_id);

    // if (updateError) {
    //     console.error("ERROR: ", updateError);
    //     return { error: "Error in updating report with file link" };
    // }

    //update user tokens
    const { token_data, token_error } = await supabase
        .from('Tokens')
        .update({ "token_amount": new_token_amount })
        .eq('id', user_id)
        .select()
    if (token_error) {
        console.error("ERROR: ", token_error)
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
    
    const { data: [token_data], error } = await supabase
    .from('Tokens')
    .select('token_amount')
    .eq('id', user_id);
    
    // data =  [ { token_amount: 500 } ]
    console.log(token_data, error, user_id)
    if (error || token_data===undefined ) {
        
        error!==null?console.error("ERROR IN GETTING USER'S TOKENS: ", error): console.error("error in getting user tokens: user not defined in tokens db");
        return {error: "error in getting user tokens"}
    }

    const user_data = { ...user.user_metadata, "id": user_id, tokens: token_data.token_amount }

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
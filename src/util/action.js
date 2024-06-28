import { json,redirect } from "react-router-dom";

export async function action({request,params}){
  const method= request.method //extract the method to react accordingly
  const data = await request.formData();

  const shelfData = {
    title: data.get('title'),
    image: data.get('image'),
    description: data.get('description'),
  }

  let url = 'http://127.0.0.1:8000/api/shelves/';

  if(method === 'PATCH'){
    const shelfId = params.shelfId
    url = `http://127.0.0.1:8000/api/shelves/${shelfId}/`
  }

  // send request to the backend 
 const response =  await fetch(url,{
    method:method,
    headers:{
      'content-Type':'application/json'
    },
    body:JSON.stringify(shelfData)
  });
//  console.log(response)
// to improve user experience validating User input & Output Validation Errors
// instead just show an error page
if(response.status === 422){
  return response;
}
  if(!response){
    throw json({message:'Could not save shelf!'},{status:500});
  }

  return redirect('/shelves');
}
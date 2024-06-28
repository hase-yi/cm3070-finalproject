import { json,redirect } from "react-router-dom";
import ShelfForm from "../../components/ShelfComponents/ShelfForm"

function NewShelfPage(){
  return (
    <ShelfForm/>
  )
}

export default NewShelfPage

export async function action({request,params}){
  const data = await request.formData();

  const shelfData = {
    title: data.get('title'),
    image: data.get('image'),
    description: data.get('description'),
  }

  // send request to the backend 
 const response =  await fetch('http://127.0.0.1:8000/api/shelves/',{
    method:'POST',
    headers:{
      'content-Type':'application/json'
    },
    body:JSON.stringify(shelfData)
  });
//  console.log(response)
  if(!response){
    throw json({message:'Could not save shelf!'},{status:500});
  }

  return redirect('/shelves');
}


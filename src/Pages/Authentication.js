import AuthForm from '../containers/AuthContainers/AuthForm';
import {json, redirect} from 'react-router-dom'

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({request}){
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') || 'login';

  if(mode !== 'login' && mode !== 'signup'){
    throw json({message:"Unsupported mode."},{status:422});
  }

  const data = await request.formData();
  const authData = {
    username:data.get('username'),
    email:data.get('email'),
    password:data.get('password'),
  };

  console.log('Auth Data:', authData); // Log the payload

  const response = await fetch(`http://127.0.0.1:8000/api/${mode}/`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(authData),
  });

  if(response.status === 422 || response.status === 401){
    const responseData = await response.json();
    console.log('Response Data:', responseData); // Log response data
    return json(responseData, { status: response.status });
  }

  if(!response.ok){
    throw json({message:'Could not authenticate user'},{status:500});
  }

  const resData = await response.json();
  const token = resData.token;

  localStorage.setItem('token', token);

  // Token management 
return redirect('/');
}
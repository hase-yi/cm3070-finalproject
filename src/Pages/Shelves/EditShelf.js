import {useRouteLoaderData } from 'react-router-dom'
import ShelfForm from '../../components/ShelfComponents/ShelfForm'

function EditShelfPage(){
  const data = useRouteLoaderData("shelf-detail");
  const shelf = data
  return <ShelfForm method = 'PATCH' shelf={shelf}/> 
}

export default EditShelfPage
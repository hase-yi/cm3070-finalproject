import { Outlet } from "react-router-dom";
import { NavLink } from 'react-router-dom';


function ShelfRootLayout(){
  return (
    <>
    	<NavLink
							to="new"
							end
						>
							New Shelf
						</NavLink>
    <Outlet/>
    </>
  )

}

export default ShelfRootLayout;
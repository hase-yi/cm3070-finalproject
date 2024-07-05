import { Outlet } from "react-router-dom";

import ShelfNavigation from "../../components/ShelfComponents/ShelfNavigation";

function ShelfRootLayout(){
  return (
    <>
    <ShelfNavigation />
    <Outlet/>
    </>
  )

}

export default ShelfRootLayout;
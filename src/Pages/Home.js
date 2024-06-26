import { Link,useNavigate } from "react-router-dom";

function HomePage(){

  return (

  <>
    <h1>My Home Page</h1>
    <p>
      Go to <Link to="/shelves"> The Shelves </Link>
    </p>
  </>
  )
}

export default HomePage;
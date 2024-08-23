
import ShelfForm from "../../components/ShelfComponents/ShelfForm"

function NewShelfPage() {

  return (
    <div>
      <h3>Add new shelf</h3>
      <ShelfForm method='POST' />

    </div>
  )

}

export default NewShelfPage




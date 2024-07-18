export default function Input({id,label,error,...props}){
  return (
    <div>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      {...props}
    />
      <div >{error && <p>{error}</p>}</div>
  </div>
  )
}
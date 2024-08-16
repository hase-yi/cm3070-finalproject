function PageContent({ title, children }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="grid">
        {children}
      </div>
    </>
  );
}

export default PageContent;
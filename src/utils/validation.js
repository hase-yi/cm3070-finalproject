export const validateShelfForm = (values) => {
	const errors = {};
	if (!values.title.trim()) {
		errors.title = 'Title is required';
	}
	if (!values.image.trim()) {
		errors.image = 'Image URL is required';
	} else if (!/^https?:\/\/.+\..+/.test(values.image)) {
		errors.image = 'Image URL must be a valid URL';
	}
	if (!values.description.trim()) {
		errors.description = 'Description is required';
	}
	return errors;
};

export const validateBookForm = (values) => {
	const errors = {};
	if (!values.isbn.trim()) {
		errors.isbn = 'ISBN is required';
	}
	if (!values.title.trim()) {
		errors.title = 'Title is required';
	}
	if (!values.author.trim()) {
		errors.author = 'Author is required';
	}
	if (!values.shelf) {
		errors.shelf = 'Shelf is required';
	}
	if (values.total_pages && isNaN(Number(values.total_pages))) {
		errors.total_pages = 'Total pages must be a number';
	}
	if (values.release_year && isNaN(Number(values.release_year))) {
		errors.release_year = 'Release year must be a number';
	}
	return errors;
};

export function isValidISBN(isbn) {

	if (isbn.length !== 13) {
    return false
  }
    
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(isbn.charAt(i));
    if (isNaN(digit)) return false;
  }

  return true;
	
}


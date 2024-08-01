import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';
import { selectFromObject } from '../utils/misc';

const BOOK_FIELDS = [
	'isbn',
	'title',
	'author',
	'total_pages',
	'release_year',
	'shelf',
	'image',
];

const READING_PROGRESS_FIELDS = ['book', 'status', 'current_page', 'shared'];
const REVIEW_FIELDS = ['book', 'date', 'shared', 'text'];
const COMMENTS_FIELDS = ['book', 'review', 'date', 'text', 'user'];

// Fetch one book by id
export const fetchBook = createAsyncThunk(
	'books/fetchBook',
	async (id, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`books/${id}/`);
			console.log('Book is:', response.data);
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			return rejectWithValue(error.message);
		}
	}
);

// Thunk to fetch all books
export const fetchBooks = createAsyncThunk(
	'books/fetchBooks',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('books/');
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			return rejectWithValue(error.message);
		}
	}
);

// Thunk to fetch books for a specific shelf
export const fetchBooksForShelf = createAsyncThunk(
	'books/fetchBooksForShelf',
	async (shelfId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('books/', {
				params: {
					shelf: shelfId,
				},
			});
			return response.data;
		} catch (error) {
			// Check if the error is from Axios
			if (error.response) {
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			return rejectWithValue(error.message);
		}
	}
);

// Thunk to create a new book
export const createBook = createAsyncThunk(
	'books/createBook',
	async (book, { rejectWithValue }) => {
		const forServer = selectFromObject(book, BOOK_FIELDS);

		try {
			const response = await axiosInstance.post('books/', forServer);
			return response.data;
		} catch (error) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error.response.data);
		}
	}
);

// Thunk to update an existing book
export const updateBook = createAsyncThunk(
	'books/updateBook',
	async (book, { rejectWithValue }) => {
		const id = book.id;
		const forServer = selectFromObject(book, BOOK_FIELDS);

		try {
			const response = await axiosInstance.put(`books/${id}/`, forServer);
			return response.data;
		} catch (error) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error.response.data);
		}
	}
);

// Thunk to delete a book
export const deleteBook = createAsyncThunk(
	'books/deleteBook',
	async (book, { rejectWithValue }) => {
		const id = book.id;

		try {
			await axiosInstance.delete(`books/${id}/`);
			return id;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			return rejectWithValue(error.message);
		}
	}
);

// Thunk to search a book
export const searchBook = createAsyncThunk(
	'books/searchBooks',
	async ({ title, isbn }, { rejectWithValue }) => {
		try {
			const params = {};
			if (title) params.title = title;
			if (isbn) params.isbn = isbn;

			const response = await axiosInstance.get('books/search', { params });
			return response.data;
		} catch (error) {
			if (error.response) {
				return rejectWithValue(error.response.data);
			} else if (error.request) {
				return rejectWithValue('No response received from server');
			} else {
				return rejectWithValue(error.message);
			}
		}
	}
);

export const createReadingProgress = createAsyncThunk(
	'books/createReadingProgress',
	async (book, { rejectWithValue }) => {
		const forServer = selectFromObject(
			book.reading_progress,
			READING_PROGRESS_FIELDS
		);

		try {
			const response = await axiosInstance.post('reading/', forServer);
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data);
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const createReview = createAsyncThunk(
	'books/createReview',
	async (book, { rejectWithValue }) => {
		const forServer = selectFromObject(book.review, REVIEW_FIELDS);

		try {
			const response = await axiosInstance.post('reviews/', forServer);
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data);
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const createComment = createAsyncThunk(
	'books/createComments',
	async (book, { rejectWithValue }) => {
		const forServer = selectFromObject(book.review.comment, COMMENTS_FIELDS);
		const reviewId = book.review.comment.review;

		console.log('reviewId  is:', reviewId);
		try {
			const response = await axiosInstance.post(
				`reviews/${reviewId}/comments/`,
				forServer
			);
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data);
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const updateReadingProgress = createAsyncThunk(
	'books/updateReadingProgress',
	async (book, { rejectWithValue }) => {
		try {
			const readingProgressId = book.reading_progress.id;
			const forServer = selectFromObject(
				book.reading_progress,
				READING_PROGRESS_FIELDS
			);

			const response = await axiosInstance.put(
				`reading/${readingProgressId}/`,
				forServer
			);

			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data); // Log the error response data
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message); // Log the error message
			return rejectWithValue(error.message);
		}
	}
);

export const updateReview = createAsyncThunk(
	'books/updateReview',
	async (book, { rejectWithValue }) => {
		try {
			const reviewId = book.review.id;
			const forServer = selectFromObject(book.review, REVIEW_FIELDS);

			const response = await axiosInstance.put(
				`reviews/${reviewId}/`,
				forServer
			);

			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data); // Log the error response data
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message); // Log the error message
			return rejectWithValue(error.message);
		}
	}
);

export const updateComment = createAsyncThunk(
	'books/updateComment',
	async (book, { rejectWithValue }) => {
		console.log("Book in thunk:", book)
		try {
			const reviewId = book.review.comment.review;
			const commentId = book.review.comment.id;
			const forServer = selectFromObject(book.review.comment, COMMENTS_FIELDS);
			console.log('Data for server is:', forServer);
			const response = await axiosInstance.put(
				`reviews/${reviewId}/comments/${commentId}/`,
				forServer
			);
			return response.data;
		} catch (error) {
			// Check if the error is from Axios and has a response
			if (error.response) {
				console.error('Error response data:', error.response.data); // Log the error response data
				return rejectWithValue(error.response.data);
			}
			// For other errors (like network issues)
			console.error('Error message:', error.message); // Log the error message
			return rejectWithValue(error.message);
		}
	}
);

const bookSlice = createSlice({
	name: 'books',
	initialState: {
		books: [],
		status: 'idle',
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBook.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchBook.fulfilled, (state, action) => {
				state.status = 'succeeded';
				const index = state.books.findIndex(
					(book) => book.id === action.payload.id
				);
				if (index === -1) {
					state.books.push(action.payload);
				} else {
					state.books[index] = action.payload;
				}
			})
			.addCase(fetchBook.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(fetchBooks.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchBooks.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.books = action.payload;
			})
			.addCase(fetchBooks.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(fetchBooksForShelf.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchBooksForShelf.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.books = action.payload;
			})
			.addCase(fetchBooksForShelf.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(createBook.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(createBook.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.books.push(action.payload);
			})
			.addCase(createBook.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload || action.error.message;
			})
			.addCase(updateBook.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(updateBook.fulfilled, (state, action) => {
				state.status = 'succeeded';
				const index = state.books.findIndex(
					(book) => book.id === action.payload.id
				);
				if (index !== -1) {
					state.books[index] = {
						...state.books[index],
						...action.payload,
					};
					// updateObject(state.books[index], action.payload);
				}
			})
			.addCase(updateBook.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload || action.error.message;
			})
			.addCase(deleteBook.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(deleteBook.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.books = state.books.filter((book) => book.id !== action.payload);
			})
			.addCase(deleteBook.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(searchBook.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(searchBook.fulfilled, (state, action) => {
				state.loading = false;
				state.books = action.payload;
			})
			.addCase(searchBook.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || 'Failded to search books';
			})
			.addCase(createReadingProgress.fulfilled, (state, action) => {
				state.status = 'succeeded';
				const index = state.books.findIndex(
					(book) => book.id === action.payload.book
				);
				if (index !== -1) {
					state.books[index] = {
						...state.books[index],
						reading_progress: { ...action.payload.book.reading_progress },
					};
				}
			})
			.addCase(updateReadingProgress.fulfilled, (state, action) => {
				const index = state.books.findIndex(
					(book) => book.id === action.payload.book.id
				);

				if (index !== -1) {
					state.books[index] = {
						...state.books[index],
						reading_progress: { ...action.payload.book.reading_progress },
					};
				}
			})
			.addCase(createReview.fulfilled, (state, action) => {
				state.satus = 'succeeded';
				const index = state.books.findIndex(
					(book) => book.id === action.payload.book.id
				);
				if (index !== -1) {
					state.books[index] = {
						...state.books[index],
						review: { ...action.payload.book.review },
					};
				}
			})
			.addCase(updateReview.fulfilled, (state, action) => {
				const index = state.books.findIndex(
					(book) => book.id === action.payload.book.id
				);
				if (index !== -1) {
					state.books[index] = {
						...state.books[index],
						review: { ...action.payload.book.review },
					};
				}
			})
			.addCase(createComment.fulfilled, (state, action) => {
				console.log('comment is:', action.payload);
				const bookIndex = state.books.findIndex(
					(book) => book.id === action.payload.book
				);

				console.log('state.books[bookIndex] is: ', state.books[bookIndex]);
				const comments = [...state.books[bookIndex].review.comments];
				comments.push(action.payload);

				if (bookIndex !== -1) {
					state.books[bookIndex] = {
						...state.books[bookIndex],
						review: {
							...state.books[bookIndex].review,
							comments: [...comments],
						},
					};
				}
			})
			.addCase(updateComment.fulfilled, (state, action) => {
				console.log('comment is:', action.payload);
				const bookIndex = state.books.findIndex(
					(book) => book.id === action.payload.book
				);

				console.log("bookIndex is:", bookIndex)

				const commentIndex = state.books[bookIndex].review.comments.findIndex(
					(comment) => comment.id === action.payload.id
				);
				console.log("commentIndex is:", commentIndex)
				const comments = [...state.books[bookIndex].review.comments];
				comments[commentIndex] = action.payload;

				if (bookIndex !== -1) {
					state.books[bookIndex] = {
						...state.books[bookIndex],
						review: {
							...state.books[bookIndex].review,
							comments: [...comments],
						},
					};
				}
			});
	},
});

export default bookSlice.reducer;

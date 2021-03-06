import axios from "axios";

const url = process.env.REACT_APP_BACKENDURL
	? process.env.REACT_APP_BACKENDURL
	: "http://localhost:5000";

console.log("BE URL: ", url);

//====================================================
export const GET_USER_START = "GET_USER_START";
export const GET_USER_SUCCESS = "GET_USER_SUCCESS";
export const GET_USER_FAILURE = "GET_USER_FAILURE";

// Retrieves user and user events from DB. Returns false if user not found
export const getUser = (token, emailAddress) => {
	return async (dispatch) => {
		dispatch({
			type: GET_USER_START,
		});
		try {
			const response = await axios.post(
				`${url}/api/user/get_user`,
				{ emailAddress: emailAddress },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			dispatch({
				type: GET_USER_SUCCESS,
				payload: response.data,
			});
		} catch (err) {
			dispatch({
				type: GET_USER_FAILURE,
				payload: err,
			});
		}
	};
};
//====================================================
export const CREATE_USER_START = "CREATE_USER_START";
export const CREATE_USER_SUCCESS = "CREATE_USER_SUCCESS";
export const CREATE_USER_FAILURE = "CREATE_USER_FAILURE";

export const createUser = (token, user) => {
	console.log("incoming user: ", user);
	return async (dispatch) => {
		dispatch({
			type: CREATE_USER_START,
		});
		try {
			const response = await axios.post(`${url}/api/user/create_user`, user, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			dispatch({
				type: CREATE_USER_SUCCESS,
				payload: response.data,
			});
		} catch (err) {
			console.log(err);
			dispatch({
				type: CREATE_USER_FAILURE,
				payload: err,
			});
		}
	};
};
//====================================================
export const SEARCH_USER_START = "SEARCH_USER_START";
export const SEARCH_USER_SUCCESS = "SEARCH_USER_SUCCESS";
export const SEARCH_USER_FAILURE = "SEARCH_USER_FAILURE";

export const searchUser = (token, userName) => {
	console.log("incoming user: ", userName);
	return async (dispatch) => {
		dispatch({
			type: SEARCH_USER_START,
		});
		try {
			const response = await axios.post(
				`${url}/api/user/search_user`,
				{ userName },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			dispatch({
				type: SEARCH_USER_SUCCESS,
				payload: response.data,
			});
		} catch (err) {
			console.log(err);
			dispatch({
				type: SEARCH_USER_FAILURE,
				payload: err,
			});
		}
	};
};

//====================================================
export const SAVE_TOKEN = "SAVE_TOKEN";

export const saveToken = (token) => {
	return (dispatch) => {
		dispatch({
			type: SAVE_TOKEN,
			payload: token,
		});
	};
};
//====================================================

import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { useAuth0 } from "../../react-auth0-spa";

import { getUser } from "../../redux/actions";

const Events = props => {
	const { user, getTokenSilently } = useAuth0();

	useEffect(() => {
		getTokenSilently().then(token => {
			props.getUser(token, user.email);
		});
	}, []);

	if (!props.isUserRetrieved) {
		return <div>Getting user info</div>;
	}

	if (props.isNewUser) {
		return <h1>Pick a username</h1>;
	}

	return (
		<div>
			<h1>Events</h1>
			<h2>Hello {user.email}</h2>
		</div>
	);
};

const mapStateToProps = ({ user, events }) => ({
	isUserRetrieved: user.isUserRetrieved,
	isNewUser: user.isNewUser,
});

const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			getUser,
		},
		dispatch
	);

export default compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps)
)(Events);

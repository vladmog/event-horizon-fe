import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { useAuth0 } from "../../react-auth0-spa";
import { Link } from "react-router-dom";

import { getUser, saveToken } from "../../redux/actions";
import FirstLogin from "./FirstLogin";

const Events = props => {
	const { user, getTokenSilently } = useAuth0();

	useEffect(() => {
		getTokenSilently().then(token => {
			props.getUser(token, user.email);
			props.saveToken(token);
		});
	}, []);

	if (!props.isUserRetrieved) {
		return <div>Getting user info</div>;
	}

	if (props.isNewUser) {
		return <FirstLogin />;
	}

	return (
		<div>
			<h1>Events</h1>
			<h2>Hello {user.email}</h2>
			<Link to="/events/create">+NEW EVENT</Link>
			<h3>Your events:</h3>
			{props.events.map(event => {
				return (
					<div key={event.id}>
						<span>{event.name}</span>
					</div>
				);
			})}
		</div>
	);
};

const mapStateToProps = ({ user, events }) => ({
	isUserRetrieved: user.isUserRetrieved,
	isNewUser: user.isNewUser,
	events: events.events,
});

const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			getUser,
			saveToken,
		},
		dispatch
	);

export default compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps)
)(Events);

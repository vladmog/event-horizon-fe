import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { useAuth0 } from "../../react-auth0-spa";
import { setUpdateMode } from "../../redux/actions";
import styled from "styled-components";

const S = {
	Container: styled.ul`
		list-style-type: none;
		padding: 0px;
		// border: solid black 1px;

		.nameRow {
			width: 100%;
			height: 30px;
			display: flex;
			justify-content: space-between;
			// border: solid green 1px;
			align-items; center; 

			button {
				border: none;
				background-color: transparent;
				text-transform: uppercase;
				cursor: pointer;
			}
		}
	`,
	Name: styled.div`
		color: ${(props) => props.color};
		font-family: "Archivo", sans-serif;
		font-weight: bold;
		// font-size: 20px;
		// border: solid blue 1px;
		display: flex;
		align-items: center;
	`,
};

const Participants = (props) => {
	const { user } = useAuth0();
	if (!props.eventParticipants) {
		return (
			<div>
				<h1>Participants</h1>
				<h4>No participants</h4>
			</div>
		);
	}
	// pass in dispUserIds as props in Availabilities.js
	// look up how to stop VS Code from autocompleting words with the wrong thing
	const clickHandler = (participant) => {
		props.setIsShowcasing(true);
		// console.log("participant", participant);
		if (participant.userId in props.dispUserIdsObj) {
			// console.log("remove user clickhandler");
			// if selected user ID being showcased, remove from showcase
			let newDispUserIdsObj = { ...props.dispUserIdsObj };
			delete newDispUserIdsObj[`${participant.userId}`];
			let newDispUserIds = props.dispUserIds.filter((id) => {
				return id !== participant.userId;
			});
			props.setDispUserIds(newDispUserIds);
			props.setDispUserIdsObj(newDispUserIdsObj);
			props.setLastDispUserRemoved(participant.userId);
		} else {
			// console.log("add user clickhandler");
			// if selected user ID not being showcased, showcase user
			// props.setDispUserIds([...props.dispUserIds, participant.userId]); // uncomment to isolate multiple users concurrently
			props.setDispUserIds([participant.userId]); // uncomment to isolate a single user at a time
			// props.setDispUserIdsObj({
			// 	...props.dispUserIdsObj,
			// 	[participant.userId]: true,  // uncomment to isolate multiple users concurrently
			// });
			props.setDispUserIdsObj({
				[participant.userId]: true, // uncomment to isolate a single user at a time
			});
		}
	};
	return (
		<S.Container>
			{props.eventParticipants.map((participant) => {
				// Default username styling
				let color = "#242424";
				let font = "Archivo";
				let fontWeight = "bold";

				// Handles dynamic styling of user names if in showcasing mode
				if (participant.userId in props.dispUserIdsObj && props.isShowcasing) {
					// If user being showcased
					font = "Archivo Black";
					fontWeight = "regular";
				} else if (props.isShowcasing) {
					// If user not being showcased
					color = "#959494";
				}
				return (
					<li key={participant.id}>
						{user.email === participant.emailAddress ? (
							// Host availability
							<div
								className={"nameRow"}
								style={{ display: "flex", cursor: "pointer" }}
							>
								<S.Name
									color={color}
									onClick={() => {
										// props.setUpdateMode(true);
										clickHandler(participant);
									}}
								>
									{participant.userName}
								</S.Name>
								<button onClick={() => props.setUpdateMode(true)}>
									update
								</button>
							</div>
						) : (
							// Participant availability
							<div className={"nameRow"}>
								<S.Name
									style={{ display: "flex", cursor: "pointer" }}
									color={color}
									onClick={() => clickHandler(participant)}
								>
									{participant.userName}
								</S.Name>
							</div>
						)}
					</li>
				);
			})}
		</S.Container>
	);
};

const mapStateToProps = ({ user, events, calendar }) => ({
	updateMode: calendar.updateMode,
});

const mapDispatchToProps = (dispatch) =>
	bindActionCreators({ setUpdateMode }, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(
	Participants
);

// TODO

// If date determined, scroll to event date
// else scroll to current date

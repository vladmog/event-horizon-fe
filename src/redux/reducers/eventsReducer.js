import {
	CREATE_EVENT_SUCCESS,
	GET_USER_SUCCESS,
	JOIN_EVENT_SUCCESS,
	GET_AVAILABILITIES_SUCCESS,
	UPDATE_AVAILABILITY_SUCCESS,
	GET_AVAILABILITIES_START,
	SET_ARE_AVAILS_OBTAINED,
	INVITE_USER_START,
	INVITE_USER_SUCCESS,
	INVITE_USER_FAILURE,
	UNINVITE_USER_START,
	UNINVITE_USER_SUCCESS,
	UNINVITE_USER_FAILURE,
	UPDATE_EVENT_START,
	UPDATE_EVENT_SUCCESS,
	UPDATE_EVENT_FAILURE,
	SET_IS_EDITING_DATE,
	SET_IS_DELETING_EVENTS,
	DELETE_EVENT_START,
	DELETE_EVENT_SUCCESS,
	DELETE_EVENT_FAILURE,
	SET_IS_LEAVING_EVENTS,
	LEAVE_EVENT_START,
	LEAVE_EVENT_SUCCESS,
	LEAVE_EVENT_FAILURE,
} from "../actions";

const initialState = {
	events: [],
	eventHashIndexes: {},
	eventsParticipants: {},
	allEventsAvailabilities: {},
	availabilitiesObj: {},
	areAvailsObtained: false,
	isEditingDate: false,
	isDeletingEvents: false,
	isLeavingEvents: false,
};

export const eventsReducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SET_ARE_AVAILS_OBTAINED:
			return {
				...state,
				areAvailsObtained: payload,
			};

		case CREATE_EVENT_SUCCESS:
			console.log("Create event payload", payload); // should be events
			if (payload) {
				let { events, usersMet } = payload;

				// parse usersMet into eventParticipants
				let participants = usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}

				// parse new event hashes
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}
				return {
					...state,
					events: events,
					eventHashIndexes: eventHashIndexes,
					eventsParticipants: eventsParticipants,
				};
			}
		case GET_USER_SUCCESS:
			// IF USER IN DB
			if (payload) {
				let events = payload.events;
				//  Create object that maps event hashes to their index in array for efficient access
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}
				// Create object of eventId's paired to participant arrays
				let participants = payload.usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}
				return {
					...state,
					events: events,
					eventHashIndexes: eventHashIndexes,
					eventsParticipants: eventsParticipants,
				};
			} else {
				// IF USER NOT IN DB
				return {
					...state,
				};
			}

		case UPDATE_EVENT_SUCCESS:
			if (payload) {
				let events = payload;
				//  Create object that maps event hashes to their index in array for efficient access
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}
				return {
					...state,
					events: events,
					eventHashIndexes: eventHashIndexes,
					isEditingDate: false,
				};
			}

		case SET_IS_EDITING_DATE:
			return {
				...state,
				isEditingDate: payload,
			};

		case SET_IS_DELETING_EVENTS:
			return {
				...state,
				isDeletingEvents: payload,
			};

		case SET_IS_LEAVING_EVENTS:
			return {
				...state,
				isLeavingEvents: payload,
			};

		case JOIN_EVENT_SUCCESS:
			if (payload) {
				let events = payload;
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}
				return {
					...state,
					events: events,
					eventHashIndexes: eventHashIndexes,
				};
			}

		case UPDATE_AVAILABILITY_SUCCESS:
			if (payload) {
				// #############################################################
				// Add event participants to `eventsParticipants` object if not added already (mainly for use when joining an event)
				// #############################################################

				// UTIL FUNCT for following step
				const isParticipantAdded = (participant, eventId) => {
					for (let i = 0; i < eventsParticipants[eventId].length; i++) {
						if (participant.id === eventsParticipants[eventId][i].id) {
							return true;
						}
					}
					return false;
				};

				let eventsParticipants = { ...state.eventsParticipants };

				let eventUsers = payload.eventUsers;
				for (let i = 0; i < eventUsers.length; i++) {
					let participant = eventUsers[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						// But only if they weren't added prior
						if (!isParticipantAdded(participant, eventId)) {
							console.log("new user adddeddd");
							eventsParticipants[eventId].push(participant);
						}
					}
				}
				// #############################################################
				// Create availabilities array to map over to render in calendar
				// #############################################################
				let availabilities = payload.eventAvailabilities;

				// If no event availabilities found, just return eventsParticipants
				if (!availabilities.length) {
					return {
						...state,
						areAvailsObtained: true,
						eventsParticipants: eventsParticipants,
					};
				}
				let eventId = availabilities[0].eventId;
				let allEventsAvailabilities = {
					...state.allEventsAvailabilities,
					[eventId]: availabilities,
				};

				// #############################################################
				// Create availability object for efficient reference
				// #############################################################

				// each availability stored in following format:
				// availabilityObj.eventId.userId.date = true
				let availabilitiesObj = { ...state.availabilitiesObj }; // experimental
				// let availabilitiesObj = {}; //original
				availabilities.forEach((avail) => {
					let eventId = avail.eventId;
					let userId = avail.userId;

					if (availabilitiesObj[`${eventId}`]) {
						if (availabilitiesObj[`${eventId}`][`${userId}`]) {
							availabilitiesObj[`${eventId}`][`${userId}`][
								`${avail.availabilityStart}`
							] = true;
						} else {
							availabilitiesObj[`${eventId}`][`${userId}`] = {};
							availabilitiesObj[`${eventId}`][`${userId}`][
								`${avail.availabilityStart}`
							] = true;
						}
					} else {
						availabilitiesObj[`${eventId}`] = {};
						availabilitiesObj[`${eventId}`][`${userId}`] = {};
						availabilitiesObj[`${eventId}`][`${userId}`][
							`${avail.availabilityStart}`
						] = true;
					}
				});

				return {
					...state,
					allEventsAvailabilities: allEventsAvailabilities,
					availabilitiesObj: availabilitiesObj,
					areAvailsObtained: true,
					eventsParticipants: eventsParticipants,
				};
			}

		case DELETE_EVENT_START:
			if (payload) {
				return {
					...state,
				};
			}
		case DELETE_EVENT_SUCCESS:
			if (payload) {
				let { events, usersMet } = payload;

				// parse usersMet into eventParticipants
				let participants = usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}

				// parse new event hashes
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}
				return {
					...state,
					events: events,
					eventHashIndexes: eventHashIndexes,
					eventsParticipants: eventsParticipants,
				};
			}
		case DELETE_EVENT_FAILURE:
			if (payload) {
				return {
					...state,
				};
			}

		case INVITE_USER_START:
			return {
				...state,
			};
		case INVITE_USER_SUCCESS:
			// if user being invited already part of event, usersMet will be returned as false
			if (!payload.usersMet) {
				return {
					...state,
				};
			} else {
				let participants = payload.usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}
				return {
					...state,
					eventsParticipants: eventsParticipants,
				};
			}
		case INVITE_USER_FAILURE:
			return {
				...state,
			};

		case UNINVITE_USER_START:
			return {
				...state,
			};
		case UNINVITE_USER_SUCCESS:
			// Create object of eventId's paired to participant arrays

			// if user being uninvited not part of event, usersMet will be returned as false
			if (!payload.usersMet) {
				return {
					...state,
				};
			} else {
				let participants = payload.usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}
				return {
					...state,
					eventsParticipants: eventsParticipants,
				};
			}
		case UNINVITE_USER_FAILURE:
			return {
				...state,
			};
		case LEAVE_EVENT_START:
			return {
				...state,
			};
		case LEAVE_EVENT_SUCCESS:
			if (payload) {
				let { usersMet, events } = payload;
				// Create object of eventId's paired to participant arrays
				let participants = usersMet;
				let eventsParticipants = {};
				for (let i = 0; i < participants.length; i++) {
					let participant = participants[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						eventsParticipants[eventId].push(participant);
					}
				}

				// parse new event hashes
				let eventHashIndexes = {};
				for (let i = 0; i < events.length; i++) {
					let eventHash = events[i].eventHash;
					let eventIndex = i;
					eventHashIndexes[eventHash] = eventIndex;
				}

				return {
					...state,
					eventsParticipants: eventsParticipants,
					events: events,
					eventHashIndexes: eventHashIndexes,
				};
			}

		case LEAVE_EVENT_FAILURE:
			return {
				...state,
			};

		case GET_AVAILABILITIES_START:
			return {
				...state,
				areAvailsObtained: false,
			};

		case GET_AVAILABILITIES_SUCCESS:
			if (payload) {
				// #############################################################
				// Add event participants to `eventsParticipants` object if not added already (mainly for use when joining an event)
				// #############################################################

				// UTIL FUNCT for following step
				const isParticipantAdded = (participant, eventId) => {
					for (let i = 0; i < eventsParticipants[eventId].length; i++) {
						if (participant.id === eventsParticipants[eventId][i].id) {
							return true;
						}
					}
					return false;
				};

				let eventsParticipants = { ...state.eventsParticipants };

				let eventUsers = payload.eventUsers;
				for (let i = 0; i < eventUsers.length; i++) {
					let participant = eventUsers[i];
					let eventId = participant.eventId;
					// Handle placement
					if (!(eventId in eventsParticipants)) {
						// If event array not created, create event array
						eventsParticipants[eventId] = [participant];
					} else {
						// If event array created, push participant to event array
						// But only if they weren't added prior
						if (!isParticipantAdded(participant, eventId)) {
							console.log("new user adddeddd");
							eventsParticipants[eventId].push(participant);
						}
					}
				}
				// #############################################################
				// Create availabilities array to map over to render in calendar
				// #############################################################
				let availabilities = payload.eventAvailabilities;

				// If no event availabilities found, just return eventsParticipants
				if (!availabilities.length) {
					return {
						...state,
						areAvailsObtained: true,
						eventsParticipants: eventsParticipants,
					};
				}
				let eventId = availabilities[0].eventId;
				let allEventsAvailabilities = {
					...state.allEventsAvailabilities,
					[eventId]: availabilities,
				};

				// #############################################################
				// Create availability object for efficient reference
				// #############################################################

				// each availability stored in following format:
				// availabilityObj.eventId.userId.date = true
				let availabilitiesObj = { ...state.availabilitiesObj }; // experimental
				// let availabilitiesObj = {}; //original
				availabilities.forEach((avail) => {
					let eventId = avail.eventId;
					let userId = avail.userId;

					if (availabilitiesObj[`${eventId}`]) {
						if (availabilitiesObj[`${eventId}`][`${userId}`]) {
							availabilitiesObj[`${eventId}`][`${userId}`][
								`${avail.availabilityStart}`
							] = true;
						} else {
							availabilitiesObj[`${eventId}`][`${userId}`] = {};
							availabilitiesObj[`${eventId}`][`${userId}`][
								`${avail.availabilityStart}`
							] = true;
						}
					} else {
						availabilitiesObj[`${eventId}`] = {};
						availabilitiesObj[`${eventId}`][`${userId}`] = {};
						availabilitiesObj[`${eventId}`][`${userId}`][
							`${avail.availabilityStart}`
						] = true;
					}
				});

				return {
					...state,
					allEventsAvailabilities: allEventsAvailabilities,
					availabilitiesObj: availabilitiesObj,
					areAvailsObtained: true,
					eventsParticipants: eventsParticipants,
				};
			}

			break; // added this to quell an error. hopefully it's cool
		default:
			return state;
	}
};

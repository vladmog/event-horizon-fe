import React from "react";
import Month from "./Month";
import styled from "styled-components";

const S = {
	Container: styled.div`
		height: 1200%;
		width: 100%;
		// border: solid blue 5px;
		box-sizing: border-box;
	`,
};

const Year = (props) => {
	const yearNumber = props.year[0][7].year;

	return (
		<S.Container>
			{props.year.map((month) => {
				return (
					<Month
						cal={props.cal}
						month={month}
						yearNumber={yearNumber}
						refs={props.refs}
						key={Math.random()}
						handleSelect={props.handleSelect}
						colorKey={props.colorKey}
						range={props.range}
					/>
				);
			})}
		</S.Container>
	);
};

export default Year;

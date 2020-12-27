import React, { Component } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";

import api from "../services/api";
import t from "../locale/he_IL";
import "./Plans.css";
import FilterAutoCompleteMultiple from "../components/FilterAutoCompleteMultiple";
import { CheckIfUserCanAccessPage } from 'hooks';

const AlertByCity = (props) => {

	CheckIfUserCanAccessPage();
	const [state, setState] = React.useState({
		plans: [],
		treePlaces: [],
		filterPlaces: [],
		searchPoint: {},
		error: false
	});

	// Hack - empty fuction
	// This function is passed as props into FilterAutoCompleteMultiple component,
	// as onFilterChange event, so it couldn't be deleted.
	function handleFilterChange(selectedCounties) {}

	React.useEffect( () => {
		async function fetchPlaces(){
			return api.get('/tree_place')
			.then(result => {
				setState({
					treePlaces: result.data.map(tree_place => {
						return { label: tree_place.PLACE};
					})
				});
			})
			.catch(error => setState({ error }));
		};
		fetchPlaces();
	} , [] );

	
	function handleSubmit() { 
		console.log('halle');
	};
	
	const { treePlaces, error, noData } = state;

	return (
		<>
			<div className="rectangle" onSubmit={handleSubmit}>
				<h5 className="container-title">{t.newAlertTree}</h5>
				{error && (
					<div className="alert alert-danger" role="alert">
						הכתובת לא נמצאה
					</div>
				)}
				<div className="selectAreaAndInterest">
					הוסיפו את הערים עליהם תרצו לקבל התראה
					<small>
						**ניתן להוסיף יותר מעיר אחת
					</small>
				</div>

				<FilterAutoCompleteMultiple
					classes=""
					placeholder="הזינו עיר, מועצה אזורית או רשות מקומית "
					inputSuggestions={treePlaces}
					onFilterChange={handleFilterChange}
				/>
				<br />

				<div> * ישנן רשויות שלא זמינות לנו כרגע</div>
				<div> תמכו בנו כדי שנוכל להגיע גם לעיר שלכם!</div>

				{error && <div className="error-container">{error}</div>}
				{noData && <div>אין כאן כלום</div>}

			</div>
		</>
	);
}

export default AlertByCity;

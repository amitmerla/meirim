import React from 'react';
import { useParams } from 'react-router-dom';
import { withGetScreen } from 'react-getscreen';
import PlanDesktop from './desktop';
import PlanMobile from './mobile';
import { useDataHandler } from './hooks';
import t from 'locale/he_IL';

const Plan = ({ isMobile }) => {
	const [tabValue, setValue] = React.useState(0);
	const [newComment, setNewComment] = React.useState(false);
	const [newCommentType, setNewCommentType] = React.useState('');;
	const [newCommentTypeError, setNewCommentTypeError] = React.useState(false);
	const [newCommentText, setNewCommentText] = React.useState('');;
	const handleTabChange = (_, newValue) => setValue(newValue);
	const handleNewComment = (newValue) => setNewComment(newValue);
	const handleNewCommentType = (_, newValue) => {
		setNewCommentType(newValue);
		setNewCommentTypeError(false);
	};
	const handleNewCommentTypeError = () => setNewCommentTypeError(true);
	const handleNewCommentText = (newValue) => setNewCommentText(newValue);
	const { id: planId } = useParams();
	const { planData, dataArea, textArea, commentsData } = useDataHandler(planId);
	const commentTypes = [
		{
			value: 'improvement-proposal',
			text: t.improvementProposal
		},
		{
			value: 'review',
			text: t.review
		},
		{
			value: 'general-opinion',
			text: t.generalOpinion
		},

	];

	if (isMobile) return <PlanDesktop
	     tabValue={tabValue}
		 handleTabChange={handleTabChange}
	     planData={planData}
		 dataArea={dataArea}
		 textArea={textArea}
		 commentsData={commentsData}
		 newComment={newComment} 
		 handleNewComment={handleNewComment} 
		 newCommentType={newCommentType}
		 handleNewCommentType={handleNewCommentType}
		 newCommentTypeError={newCommentTypeError}
		 handleNewCommentTypeError={handleNewCommentTypeError} 
		 newCommentText={newCommentText}
		 handleNewCommentText={handleNewCommentText}
		 commentTypes={commentTypes}/>;
	else return <PlanMobile/>;
};

export default withGetScreen(Plan);

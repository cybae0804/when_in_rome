import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import axios from 'axios';
import { postReview, getExperienceDetails } from '../../../../../actions';
import Input from '../../../../shared/input/input';
import Dropdown from '../../../../shared/dropdown/dropdown';

class ReviewForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      review: '',
      canPostReview: false,
      postedReview: false,
    }
  }

  async componentDidMount() {
    const { experience_id } = this.props.match.params;

    const { data: { success }} = await axios.get(`/api/experiences/${experience_id}/reviews`);
    
    this.setState({
      postedReview: success,
    });
  }

  handlePostReview = async values => {
    const { experience_id } = this.props.match.params;
    
    const success = await this.props.postReview(values, experience_id);
    
    if (success) {
      this.setState({
        postedReview: true,
      });

      await this.props.getExperienceDetails(experience_id);

      this.props.reset();
    }
  }

  renderPostReviewForm = () => {
    const { props: { handleSubmit }, handlePostReview } = this;

    return (
      <form onSubmit={handleSubmit(handlePostReview)} className="ui form container">
        <Field component={Input} type="textarea" id="review" name="review" label="Review" />
        <Field component={Dropdown} values={[5, 4, 3, 2, 1]} id="rating" name="rating" label="Rating" />
        <a name="review-position"><button className="ui positive button">Submit</button></a>
      </form>
    );
  }

  postReview = () => {
    if (this.props.auth) {
      this.setState({
        canPostReview: true,
      });
    } else {
      localStorage.setItem('redirectUrl', this.props.location.pathname);

      this.props.history.push('/login');
    }
  }

  render() {
    const { state: { canPostReview, postedReview }, renderPostReviewForm, postReview} = this;

    if (postedReview) return null;

    const output = canPostReview ? 
                   renderPostReviewForm() :
                   <button onClick={postReview} className="ui positive button">Write a Review</button>; 
  
    return output;
  }
}

function validate({ review, rating }) {
  const errors = {};

  if (!review) errors.review = 'Please enter a review';
  if (!rating) errors.rating = 'Please enter a rating';

  return errors;
}

function mapStateToProps(state) {
  return {
    auth: state.user.auth,
  };
}

ReviewForm = reduxForm({
  form: 'review-form',
  validate,
})(ReviewForm);

export default connect(mapStateToProps, {
  postReview,
  getExperienceDetails,
})(withRouter(ReviewForm));

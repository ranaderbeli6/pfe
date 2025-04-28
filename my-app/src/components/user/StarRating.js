import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '../../Styles/user/StarRating.css';

const StarRating = ({ rating = 0, editable = false, setRating }) => {
  const numericRating = Math.min(5, Math.max(0, Number(rating) || 0));
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;

  const handleClick = (newRating) => {
    if (editable && setRating) {
      setRating(newRating);
    }
  };

  return (
    <div className={`star-rating ${editable ? 'editable' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= fullStars) {
          return (
            <FaStar 
              key={star} 
              className="star full-star" 
              onClick={() => handleClick(star)}
            />
          );
        }
        if (star === fullStars + 1 && hasHalfStar) {
          return (
            <FaStarHalfAlt 
              key={star} 
              className="star half-star" 
              onClick={() => handleClick(star)}
            />
          );
        }
        return (
          <FaRegStar 
            key={star} 
            className="star empty-star" 
            onClick={() => handleClick(star)}
          />
        );
      })}
      {!editable && (
        <span className="rating-value">{numericRating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
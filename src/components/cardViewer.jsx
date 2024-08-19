import React, { useState, useEffect } from "react";
import axios from "axios";
import ArogyamCard from "./ArogyaCard";
const CardView = ({ cardId }) => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:6060/cards/${cardId}`
        );
        setCard(response.data.data);
      } catch (err) {
        setError("Card not exists");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div id="card-view">
      <ArogyamCard />
      <p>
        <strong>Name:</strong> {card.name}
      </p>
      <p>
        <strong>Birth Year:</strong> {card.birthYear}
      </p>
      <p>
        <strong>Blood Group:</strong> {card.bloodGroup}
      </p>
      <p>
        <strong>Gender:</strong> {card.gender}
      </p>
      <p>
        <strong>Father/Husband Name:</strong> {card.fatherHusbandName}
      </p>
      <p>
        <strong>Phone:</strong> <a href={`tel:${card.phone}`}>{card.phone}</a>
      </p>
      <p>
        <strong>Emergency Contact:</strong> {card.emergencyContact}
      </p>
      <p>
        <strong>Address:</strong>{" "}
        {`${card.area}, ${card.tehsil}, ${card.district}, ${card.state}`}
      </p>
    </div>
  );
};

export default CardView;

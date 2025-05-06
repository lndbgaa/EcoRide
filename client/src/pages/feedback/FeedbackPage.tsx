import { Link } from "react-router-dom";

const FeedbackPage = () => {
  return (
    <div>
      <h1>Votre trajet s'est bien passé ?</h1>
      <div>
        <Link to="/feedback/review">
          <button>👍 Tout s'est bien déroulé</button>
        </Link>
        <Link to="/feedback/incident">
          <button>👎 J'ai rencontré un problème</button>
        </Link>
      </div>
    </div>
  );
};

export default FeedbackPage;

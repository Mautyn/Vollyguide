import { Link } from 'react-router';
import { strings } from '../strings';

export function HomePage() {
  return (
    <section className="home">
      <h1>{strings.home.title}</h1>
      <p>{strings.home.intro}</p>
      <Link className="button" to="/court">
        {strings.home.openCourt}
      </Link>
    </section>
  );
}

import { Button } from "../components/ui/button";
import { Link } from "react-router";

function NotFound() {
  return (
    <>
      <div>
        <h1 className="text-2xl text-black">Essa página não existe</h1>
        <Button variant="default" render={<Link to="/" />}>
          Ir para o inicio
        </Button>
      </div>
    </>
  );
}

export default NotFound;

import Css from "../lessons/css/Css";
import Html from "../lessons/html/Html";
import JavaScript from "../lessons/js/JavaScript";

interface Props {
	screenName: string;
}

export default function ScreenJourney({ screenName }: Props) {
	if (screenName == "Css") return <Css />;
	if (screenName == "Html") return <Html />;
	if (screenName == "Javascript") return <JavaScript />;
}

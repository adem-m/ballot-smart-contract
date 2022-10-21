import './VoteList.css';
import Paper from "@mui/material/Paper";
import {Vote} from "../vote/Vote";

export const VoteList = () => {
    const votes = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eros nisl, lobortis sit amet suscipit eu, pellentesque sit amet odio. Cras imperdiet purus et lobortis luctus. Ut sodales massa nibh, sollicitudin mollis risus posuere sed. Nunc lacinia lorem vel purus tempor, eget semper risus lobortis. Sed sit amet neque at metus varius lobortis. Morbi mauris turpis, sagittis fermentum ligula eu, vulputate pulvinar dui. Maecenas vel mi et justo venenatis volutpat.?", "Sentez-vous des pieds?", "Prout?"];

    return (
        <Paper className="paper" elevation={3}>
            <div className="block-label">Votes</div>
            {
                votes.map(vote => <Vote key={vote} question={vote}/>)
            }
        </Paper>
    );
};
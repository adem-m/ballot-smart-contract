import './Vote.css';
import {Rating} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import {useState} from "react";

export const Vote = ({question}) => {
    const labels = {
        1: 'Pas du tout d\'accord',
        2: 'Pas d\'accord',
        3: 'Ni d\'accord ni en désaccord',
        4: 'D\'accord',
        5: 'Tout à fait d\'accord',
    };

    const [value, setValue] = useState(-1);
    const [hover, setHover] = useState(-1);

    return (
        <div className="vote">
            <div className="vote-question">
                {question}
            </div>
            <div className="vote-rating-block">
                <div className="vote-label">{labels[hover !== -1 ? hover : value]}</div>
                <Rating
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                        setHover(newHover);
                    }}
                    emptyIcon={<StarIcon style={{opacity: 0.55}} fontSize="inherit"/>}
                />
            </div>
        </div>
    );
};
import {Collapse, ListItem, Rating, styled} from "@mui/material";
import {grey100} from "mui/source/styles/colors";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

const voteIcons = {
    1: {
        icon: <SentimentVeryDissatisfiedIcon color="error" />,
        label: "Tout à fait d'accord",
    },
    2: {
        icon: <SentimentDissatisfiedIcon color="error" />,
        label: "D'accord",
    },
    3: {
        icon: <SentimentSatisfiedIcon color="warning" />,
        label: "Sans opinion",
    },
    4: {
        icon: <SentimentSatisfiedAltIcon color="success" />,
        label: "Pas d'accord",
    },
    5: {
        icon: <SentimentVerySatisfiedIcon color="success" />,
        label: "Pas du tout d'accord",
    },
};

function IconContainer(props) {
    const { value, ...other } = props;
    return <span {...other}>{voteIcons[value].icon}</span>;
}

const StyledRating = styled(Rating)(({ theme }) => ({
    '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
        color: theme.palette.action.disabled,
    },
}));

export default function Vote(props) {
    let open = false
    return(
        <ListItem alignItems="flex-start" bg={grey100}>
            <h5>{props.question}</h5>
            <div className={"vote_answer"}>
                <StyledRating
                    name="highlight-selected-only"
                    defaultValue={3}
                    IconContainerComponent={IconContainer}
                    getLabelText={(value) => voteIcons[value].label}
                    highlightSelectedOnly
                    onClick={(event) => {console.log(event); open = true}}
                />
                <Collapse in={open} timeout="auto"  unmountOnExit>
                    <h4>Mettre les résultats</h4>
                </Collapse>
            </div>
        </ListItem>
    )
}